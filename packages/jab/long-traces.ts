import type async_hooks from "async_hooks";
import {
  assert,
  CapturedStack,
  captureOwnStack,
  ParsedStackFrame,
  replaceGlobalClass,
  restoreGlobalClass,
} from "^jab";

//inspired by: https://github.com/AndreasMadsen/trace/blob/master/trace.js

//Monkey patches Error constructor.
// This is needed, because we can't determine at a later time, which async context the error was constructed in.
// Problem: extending Error must be done after enabling, to get things work for those errors.

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

//to be able to remove it, when disable.
let CachedProxyErrorForLongTrace: any;

/**
 * Hacky. But errors might be processed in another context. So we need this information rightaway.
 *
 * - Must be executed before any error objects are created. And any classes inherit from `Error`. Because Error is monkey patched.
 *
 * impl
 *  - selenium contructs errors without 'new' keyword, so it has to be a plain function.
 *      Which is the reason for the custom extend-function. Maybe TypeScript to ES5 would work.
 *  - We replace `Error`, so we need to capture it at define time.
 */
export const makeProxyErrorForLongTrace = () => {
  const OriginalError = Error; //captured at enable-time.

  function ProxyErrorForLongTrace(msg?: string) {
    const error = new OriginalError(msg);

    if (enabled) {
      try {
        //we need to look up here, so we have a reference to the context. Otherwise it might get garbage collected.

        const traceData = ancestorTraceDataById.get(
          asyncHooksImpl.executionAsyncId()
        );

        //for `captureStack` to use.

        Object.defineProperty(error, "getAncestorStackFrames", {
          value: (): CapturedStack => ({
            type: "node-parsed",
            stack: getAncestorTrace(traceData),
          }),
          enumerable: false,
          configurable: true,
        });
      } catch (e) {
        //throwing when making an error, would be problematic.
        console.log("Panic in ProxyErrorForLongTrace: " + e);
      }
    }

    return error;
  }

  //copy all static properties from Error

  // This also copies the prototype property, which means:
  // 1. Make instances of Error also instance of ProxyErrorForLongTrace.
  //      - Already existing instances of Error will return true for `error instanceof ProxyErrorForLongTrace`
  //      - ProxyErrorForLongTrace also returns instances for Error, so it also need it, for `instanceof` to work.
  // 2. And get inherited methods.

  //quick fix for bug in "1.0.2-dev.1". Released long-traces didn't inherit properly.
  const quick_fix = Error.hasOwnProperty("stackTraceLimit")
    ? Error
    : Object.getPrototypeOf(Error);

  for (const method of Object.getOwnPropertyNames(quick_fix)) {
    if (
      method === "_originalGlobalClass" || //how to handle this one?
      method === "length" ||
      method === "name" ||
      method === "caller" ||
      method === "callee" ||
      method === "arguments"
    ) {
      continue;
    }

    (ProxyErrorForLongTrace as any)[method] = (Error as any)[method];
  }

  return ProxyErrorForLongTrace;
};

/**
 *
 * - Takes the async_hooks module to avoid being depend on node.
 *    Teoretically a polyfill for the browser could be implemented.
 */
export const enable = (_asyncHooksImpl: typeof async_hooks) => {
  assert(!enabled, "Already enabled");

  CachedProxyErrorForLongTrace = makeProxyErrorForLongTrace();

  replaceGlobalClass("Error", CachedProxyErrorForLongTrace);

  enabled = true;
  asyncHooksImpl = _asyncHooksImpl;

  longTraceHooks = asyncHooksImpl.createHook({
    /**
     * This is called in the parent scope, so we can get the parent trace and store it under the child id.
     */
    init(asyncId: number, type: AsyncType, triggerAsyncId: number) {
      if (asyncHooksImpl.executionAsyncId() === asyncId) {
        console.log("init() - excepted other async id.");
      }

      if (
        type !== "PROMISE" &&
        asyncHooksImpl.executionAsyncId() !== 0 &&
        triggerAsyncId !== 0 &&
        asyncHooksImpl.executionAsyncId() !== triggerAsyncId
      ) {
        //outputter stadig
        // console.log(
        //   "triggerAsyncId ambiguous " +
        //     asyncHooksImpl.executionAsyncId() +
        //     " " +
        //     triggerAsyncId
        // );
      }

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
     * Async hooks only calls this for chained promises. Not for root promises.
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
     */
    after(asyncId: number) {
      if (asyncHooksImpl.executionAsyncId() !== asyncId) {
        console.log("after() - excepted other async id: " + asyncHooksImpl.executionAsyncId() + " " + asyncId); // prettier-ignore
      }
    },

    /**
     * todo: use as contract test.
     */
    promiseResolve(asyncId: number) {
      if (asyncHooksImpl.executionAsyncId() !== asyncId) {
        // console.log("root promise " + asyncId);
      } else {
        // console.log("chained promise " + asyncId);
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
  if (Error !== (CachedProxyErrorForLongTrace as any)) {
    throw new Error("The ErrorContructor has been changed since enable");
  }

  restoreGlobalClass("Error", CachedProxyErrorForLongTrace);

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
