import nativeModule from "module";
import sourceMapSupport from "source-map-support";

import { ParsedStackFrame } from "^jab";
import { nodeRequire } from "^jab-node";
import { UninstallInfo } from "^jacs";
import {
  CaIndex,
  ConsumerShould,
  ConsumerStates,
  ProducerStates,
  ResultType,
} from "./protocol";

/**
 * This is hacky
 *
 */
export const unRegisterTsCompiler = () => {
  delete nodeRequire.extensions[".ts"];
  delete nodeRequire.extensions[".tsx"];
};

/**
 * This is hacky
 *
 * bug
 *  - Error.prepareStackTrace wont be reinstalled by source-map-support. But happily, jacs has its own.
 */
export const unRegisterSourceMapSupport = (uninstallInfo: UninstallInfo) => {
  (nativeModule.prototype as any)._compile = uninstallInfo._compile;
  Error.prepareStackTrace = uninstallInfo.prepareStackTrace;
};

/**
 *
 */
export const getDebugSummary = (
  file: string,
  controlArray: Int32Array,
  timeout: number,
  softTimeout?: number
) => {
  const resultType = controlArray[CaIndex.result_type] as ResultType; // prettier-ignore
  const dataLength = controlArray[CaIndex.data_length];
  const consumerState = ConsumerStates[controlArray[CaIndex.consumer_state]]; // prettier-ignore
  const postProducerState = ProducerStates[controlArray[CaIndex.producer_state]]; // prettier-ignore
  const shouldSleep = ConsumerShould[controlArray[CaIndex.sleep_bit]];

  return {
    file,
    consumerState,
    producerState: postProducerState,
    resultType: ResultType[resultType],
    dataLength,
    shouldSleep,
    timeout,
    softTimeout,
  };
};

/**
 * - Collect call site information into one string.
 *
 * note
 *  - maybe take from source-map-support#CallSiteToString
 */
export const getFunctionNameFromFrame = (frame: NodeJS.CallSite) => {
  let composedFunc;

  if (frame.getTypeName() !== null) {
    if (frame.getMethodName() !== null) {
      composedFunc = frame.getTypeName() + "." + frame.getMethodName();
    } else {
      composedFunc = frame.getTypeName() + ".<anonymous>";
    }
  } else {
    if (frame.getMethodName() !== null) {
      composedFunc = frame.getMethodName();
    } else {
      composedFunc = "";
    }
  }

  //check

  let func = frame.getFunctionName();

  if (func === null) {
    func = composedFunc;
  }

  return func;
};

/**
 * Extract info from call sites.
 *
 *  - It's still needed to `sourceMapSupport.install`, because this only replaces 'sourceMapSupport.prepareStackTrace'
 *  - Return the conventional stack-string and a 'parsed' stack.
 *  - include non-source-mapped line and file. (useful for opening files in node_modules folder)
 *
 * note
 *  - taken from source-map-support#prepareStackTrace
 *      tried to preserve `curPosition` and `nextPosition`. But don't know their purpose.
 */
export const extractStackTraceInfo = (
  error: Error,
  stackTraces: NodeJS.CallSite[]
) => {
  const name = error.name || "Error";
  const message = error.message || "";
  const errorString = name + ": " + message;

  const state = { nextPosition: null, curPosition: null };

  const processedStack = [];
  const fullInfo = [];

  for (let i = stackTraces.length - 1; i >= 0; i--) {
    const frame = (sourceMapSupport as any).wrapCallSite(stackTraces[i], state);

    processedStack.push("\n    at " + frame);

    const info: ParsedStackFrame = {
      line: frame.getLineNumber(),
      file: frame.getFileName(),
    };

    //function

    const func = getFunctionNameFromFrame(frame);

    if (func !== null) {
      info.func = func;
    }

    //line

    const line = stackTraces[i].getLineNumber();

    if (info.line !== line && line !== null) {
      info.rawLine = line;
    }

    //file

    const file = stackTraces[i].getFileName();

    if (info.file !== file && file !== null) {
      info.rawFile = file;
    }

    //done

    fullInfo.push(info);

    state.nextPosition = state.curPosition;
  }

  state.curPosition = state.nextPosition = null;

  //return

  const stack = errorString + processedStack.reverse().join("");

  return { stack, fullInfo: fullInfo.reverse() };
};
