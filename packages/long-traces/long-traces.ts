import async_hooks from "node:async_hooks";

import {
  assert,
  CapturedStack,
  captureStack,
  ParsedStackFrame,
  replaceGlobalClass,
} from "^jab";
import { onThrow } from "./internal";

//Monkey patches Error constructor.
// This is needed, because we can't determine at a later time, which async context the error was constructed in.
// Problem: extending Error must be done after enabling, to get things work for those errors.
//
//notes
// it's a problem to get access to all error constructions. Natively thrown errors (nodejs, v8) are not monkey patchable.
//  it's not possible to detect when they are constructed or have some code run at construction.

type AsyncType = "PROMISE" | "Timeout" | "FSREQCALLBACK"; //and a lot more.

type TraceData = {
  asyncId: number;
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
let unreplaceErrorClass: () => void;

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

  const OriginalPrepareStackTrace = Error.prepareStackTrace;

  //todo: Error has an options argument too.
  function ProxyErrorForLongTrace(msg?: string) {
    const error = new OriginalError(msg);

    addPropertiesToError(error);

    return error;
  }

  //copy all static properties from Error

  //duplication between makeProxyErrorForLongTrace and makePromiseConstructor

  // This also copies the prototype property, which means:
  // 1. Instances of Error are also instances of ProxyErrorForLongTrace.
  //      - Already existing instances of Error will return true for `error instanceof ProxyErrorForLongTrace`
  //      - ProxyErrorForLongTrace also returns instances for Error, so it also need it, for `instanceof` to work.
  // 2. And get inherited methods.

  for (const method of Object.getOwnPropertyNames(Error)) {
    if (
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

  //hope the stack trace is accessed in same tick.

  ProxyErrorForLongTrace.prepareStackTrace = (
    error: Error & {
      traceData?: TraceData;
      getAncestorStackFrames?: any;
    },
    stackTraces: NodeJS.CallSite[]
  ) => {
    try {
      //check the id is registered.

      if (!error.getAncestorStackFrames) {
        addPropertiesToError(error);
      }

      //the original work

      if (!OriginalPrepareStackTrace) {
        //what to do here. Now we have responsibility to format the stack,
        // but there is no default implementation to call.
        console.log("not impl: no original Error.prepareStackTrace");
        return;
      }

      return OriginalPrepareStackTrace(error, stackTraces);
    } catch (e) {
      //throwing when making an error, would be problematic.
      console.log("Panic in ProxyErrorForLongTrace.prepareStackTrace: " + e);
    }
  };

  return ProxyErrorForLongTrace;
};

/**
 *
 */
export const addPropertiesToError = (error: any) => {
  if (enabled) {
    try {
      //we need to look up here, so we have a reference to the context. Otherwise it might get garbage collected.

      const traceData = ancestorTraceDataById.get(
        asyncHooksImpl.executionAsyncId()
      );

      //for `captureStack` to use.

      Object.defineProperty(error, "getAncestorStackFrames", {
        value: (): CapturedStack => ({
          type: "parsed",
          stack: getAncestorStackFrames(traceData),
        }),
        enumerable: false,
        configurable: true,
      });

      //for consistency check

      Object.defineProperty(error, "traceData", {
        value: traceData,
        enumerable: false,
        configurable: true,
      });
    } catch (e) {
      //throwing when making an error, would be problematic.
      console.log("Panic in ProxyErrorForLongTrace: " + e);
    }
  }
};

/**
 *
 * - Takes the async_hooks module to avoid being depend on node.
 *    Theoretically a polyfill for the browser could be implemented.
 */
export const enable = (_asyncHooksImpl: typeof async_hooks) => {
  assert(!enabled, "Already enabled");

  unreplaceErrorClass = replaceGlobalClass(
    "Error",
    makeProxyErrorForLongTrace()
  );

  onThrow((error: any) => {
    if (!error.getAncestorStackFrames) {
      addPropertiesToError(error);
    }
  });

  enabled = true;
  asyncHooksImpl = _asyncHooksImpl;

  longTraceHooks = asyncHooksImpl.createHook({
    /**
     * This is called in the parent scope, so we can get the parent trace and store it under the child id.
     */
    init(asyncId: number, type: AsyncType, triggerAsyncId: number) {
      if (asyncHooksImpl.executionAsyncId() === asyncId) {
        console.log("init() - expected other async id.");
      }

      const err = new Error(); //this becomes the parent for errors thrown in this context.

      (err as any).__jawisSynctheticLongTracesError = true; //to ensure we don't check cons/prep asyncId consistency.

      const traceData: TraceData = {
        asyncId,
        parentId: triggerAsyncId,
        err,
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
  unreplaceErrorClass();

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
const getAncestorStackFrames = (traceData?: TraceData): ParsedStackFrame[] => {
  //check if we have ancestry registered

  if (!traceData) {
    return [];
  }

  //maybe it's cached

  if (traceData.cached) {
    return traceData.cached;
  }

  //make it

  const result = getAncestorStackFramesReal(traceData);

  //cache it

  traceData.cached = result;

  return result;
};

/**
 * Recursively the the trace for all ancestors.
 */
const getAncestorStackFramesReal = (traceData: TraceData) => {
  let result: ParsedStackFrame[] = [{ file: "-----" }];

  //immediate parent trace

  const stack = captureStack(traceData.err);

  //node-parsed for for backwards compat
  if (stack.type !== "parsed" && (stack as any).type !== "node-parsed") {
    throw new Error("only implemented for jacs.");
  }

  const frames = stack.stack as ParsedStackFrame[];

  //only keep one frame for chained promises

  if (traceData.chainedPromise) {
    result = [...result, ...getChainedPromiseFrames(frames)];
  } else {
    result = [...result, ...frames];
  }

  //all ancestors, if any.

  const ancestorTrace = getAncestorStackFrames(ancestorTree.get(traceData)); // prettier-ignore

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
