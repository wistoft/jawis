import type async_hooks from "async_hooks";
import { assert, CapturedStack, captureOwnStack, ParsedStackFrame } from "^jab";

//inspired by: https://github.com/AndreasMadsen/trace/blob/master/trace.js

//Monkey patches Error constructor.
// This is needed, because we can't determine at a later time, which async context the error was constructed in.
// Problem: instanceof operator stops working for `Error`, so the function `isInstanceOf` can be used.

declare const global: any;

type AsyncType = "PROMISE" | "Timeout" | "FSREQCALLBACK"; //and a lot more.

type TraceData = {
  parentId: number;
  err: Error;
  type: AsyncType;
  chainedPromise?: boolean;
  cached?: ParsedStackFrame[];
};

let enabled = false;
let asyncHooksImpl: typeof async_hooks;
let longTraceHooks: any; //async_hooks.AsyncHook;

//For getting the parent data for the given child context.
// It's created when an async context is created, and deleted when the context is destroyed.
// We can delete this entry so fast, because Error-proxy resolves ancestry data synchronouly.
//
// childId => trace data
const ancestorTraceDataById = new Map<number, TraceData | undefined>();

//Retains parent data as long the child have a reference to it.
// This is needed, because parent contexts may be destroyed before child contexts.
// Garbage collection will ensure data is removed, when no decendents exists.
//
// child trace data => parent trace data.
//
//todo: this tree can be stored as references in the trace data. So the map becomes unneeded.
const ancestorTree = new WeakMap<TraceData, TraceData | undefined>();

/**
 *
 * - Simplied version of what TypeScript uses for downleveling classes to ES5
 * - Remember in constructor: Call super, and use returned value as `this`, and return `this`.
 *
 * note
 *  - Senitive to code position, because it's used during module load.
 */
export function extend(_child: object, _super: object) {
  if (typeof _super !== "function" && _super !== null)
    throw new TypeError(
      "Class extends value " + String(_super) + " is not a constructor"
    );

  Object.setPrototypeOf(_child, _super);

  function PrototypeObject(this: any) {
    this.constructor = _child;
  }

  PrototypeObject.prototype = _super.prototype;

  (_child as any).prototype = new (PrototypeObject as any)();
}

/**
 *
 */
export function replaceGlobalClass(_original: string, _new: any) {
  _new._originalGlobalClass = global[_original];
  global[_original] = _new;
}

/**
 *
 */
export function restoreGlobalClass(_original: string, _new: any) {
  if (_new !== global[_original]) {
    throw new Error(
      "The given class isn't the global now, class: " + _original
    );
  }

  global[_original] = _new._originalGlobalClass;
}

/**
 * Replaces the `instanceof` operator when `replaceGlobalClass` has been used.
 */
export function isInstanceOf<T extends new (...args: any) => any>(
  obj: any,
  parent: T
): obj is InstanceType<T> {
  let original = parent as any;

  while (original._originalGlobalClass) {
    original = original._originalGlobalClass;
  }

  return obj instanceof original;
}

/**
 * Hacky. But errors might be processed in another context. So we need this information rightaway.
 *
 * - Must be executed before any error objects are created. And any classes inherit from `Error`. Because Error is monkey patched.
 *
 * impl
 *  - selenium contruct errors without 'new' keyword, so it has to be a plain function.
 *      Which is the reason the the custom extend-function. Maybe TypeScript to ES5 would work.
 *  - We replace `Error`, so we need to capture it at define time.
 */
export const ProxyErrorForLongTrace = ((_super) => {
  function ProxyErrorForLongTrace(this: any, ...args: any) {
    const _this = _super.apply(this, args) || this;

    if (enabled) {
      try {
        //we need to look up here, so we have a reference to the context. Otherwise it might get garbage collected.

        const traceData = ancestorTraceDataById.get(
          asyncHooksImpl.executionAsyncId()
        );

        //for `captureStack` to use.

        Object.defineProperty(_this, "getAncestorStackFrames", {
          value: (): CapturedStack => ({
            type: "node-parsed",
            stack: getAncestorTrace(traceData),
          }),
          enumerable: false,
          configurable: true,
        });
      } catch (error) {
        //throwing when making an error, would be problematic.
        console.log("Panic in ProxyErrorForLongTrace: " + error);
      }
    }

    return _this;
  }

  extend(ProxyErrorForLongTrace, Error);

  return ProxyErrorForLongTrace;
})(Error);

/**
 *
 * - Takes the async_hooks module to avoid being depend on node.
 *    Teoretically a polyfill for the browser could be implemented.
 */
export const enable = (_asyncHooksImpl: typeof async_hooks) => {
  assert(!enabled, "Already enabled");

  replaceGlobalClass("Error", ProxyErrorForLongTrace); //hacky, but no other way.

  enabled = true;
  asyncHooksImpl = _asyncHooksImpl;

  longTraceHooks = asyncHooksImpl.createHook({
    /**
     * This is called in the parent scope, so we can get the parent trace and store it under the child id.
     */
    init(asyncId: number, type: AsyncType, triggerAsyncId: number) {
      const traceData: TraceData = {
        parentId: triggerAsyncId,
        err: new Error(), //this becomes the parent for errors thrown in this context.
        type,
      };

      ancestorTraceDataById.set(asyncId, traceData);

      ancestorTree.set(
        traceData,
        ancestorTraceDataById.get(traceData.parentId)
      );
    },

    /**
     * Only called for chained promises.
     *
     */
    before(asyncId: number) {
      const traceData = ancestorTraceDataById.get(asyncId);

      if (traceData && traceData.type === "PROMISE") {
        traceData.chainedPromise = true;
      }
    },

    /**
     *
     * Ancestry is stored on error objects. They will have a reference to their parent,
     *  if the stack is needed.
     *
     * We can remove the mapping from context id to trace data, because no error can be thrown here, now.
     *
     * note: entry in ancestorTree will be garbage collected, when all children are destroyed.
     */
    destroy(asyncId: number) {
      ancestorTraceDataById.delete(asyncId);
    },
  });

  longTraceHooks.enable();
};

/**
 *
 */
export const disable = () => {
  if (Error !== (ProxyErrorForLongTrace as any)) {
    throw new Error("The ErrorContructor has been changed since enable");
  }

  restoreGlobalClass("Error", ProxyErrorForLongTrace);

  longTraceHooks.disable();

  enabled = false;
  asyncHooksImpl = undefined as any;
  longTraceHooks = undefined as any;

  ancestorTraceDataById.clear();
};

/**
 *
 * - Caches `getAncestorTraceReal`, which does the real work.
 */
const getAncestorTrace = (traceData?: TraceData): ParsedStackFrame[] => {
  //check if we have ancestry registered

  if (!traceData) {
    return [];
  }

  //maybe it's cached

  if (traceData.cached) {
    return traceData.cached;
  }

  //make it

  const result = getAncestorTraceReal(traceData);

  //cache it

  traceData.cached = result;

  return result;
};

/**
 * Recursively the the trace for all ancestors.
 */
const getAncestorTraceReal = (traceData: TraceData) => {
  let result: ParsedStackFrame[] = [{ file: "-----" }];

  //immediate parent trace

  const stack = captureOwnStack(traceData.err);

  if (stack.type !== "node-parsed") {
    throw new Error("only implemented for jacs.");
  }

  //only keep few frames for chained promises

  if (traceData.chainedPromise) {
    result = [...result, ...getChainedPromiseFrames(stack.stack)];
  } else {
    result = [...result, ...stack.stack];
  }

  //all ancesters, if any.

  const ancestorTrace = getAncestorTrace(ancestorTree.get(traceData)); // prettier-ignore

  //return

  return [...result, ...ancestorTrace];
};

/**
 * Returns the first frame, that belongs to the user. Defined as:
 *  - not a builtin module
 *  - not from node_modules.
 *
 */
const getChainedPromiseFrames = (allFrames: ParsedStackFrame[]) => {
  for (const frame of allFrames) {
    //quick fix for development

    if (frame.func === "init" || frame.file?.endsWith("long-traces.ts")) {
      continue;
    }

    //quick fix for development

    if (
      frame.func === "JarunPromise" ||
      frame.file?.endsWith("JarunPromise.ts")
    ) {
      continue;
    }

    //native node frames. todo: use builtin-module

    if (
      frame.file?.startsWith("internal") ||
      !frame.file?.replace(/\\/g, "/").includes("/") ||
      frame.file?.includes("node_modules")
    ) {
      continue;
    }

    return [frame];
  }

  //what else to do? When no frames was found.
  return [];
};
