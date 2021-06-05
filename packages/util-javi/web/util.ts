import ErrorStackParser from "error-stack-parser";
import NodeStackTrace from "stack-trace";
import StackTrace, { StackFrame } from "stacktrace-js";
import StackTraceGPS from "stacktrace-gps";

import {
  ErrorData,
  isNode,
  ParsedErrorData,
  ParsedStackFrame,
  sleeping,
  UnparsedStack,
} from "^jab";

export const filterErrorMessage = (msg: string) => msg.replace(/^Error: /, "");

/**
 * Produce a parsed stack for ViewException component.
 */
export const parseErrorData = (error: ErrorData): ParsedErrorData => ({
  ...error,
  parsedStack: parseTrace(error.stack),
});

/**
 *
 * - parse node stack traces with node-stack-trace, because error-stack-parser is buggy.
 *
 *
 * note
 *  error-stack-parser has a lot of logic for Opera, but it's outdated. Current Opera
 *    use v8 format. So there is no need to think about capturing anything but the
 *    `error.stack` property. It will work for all (modern) browsers and node.
 */
export const parseTrace = (stack: UnparsedStack): ParsedStackFrame[] => {
  if (stack.stack === undefined || stack.stack === "") {
    //error-stack-parser can't handle this case
    return [];
  }

  if (stack.type === "node") {
    return parseNodeTrace(stack.stack);
  } else if (stack.type === "node-parsed") {
    return stack.stack;
  } else {
    return ErrorStackParser.parse({
      stack: stack.stack,
    } as Error).map((elm) => ({
      line: elm.lineNumber,
      file: elm.fileName,
      func: elm.functionName,
    }));
  }
};

/**
 * parse and use source map to find original file and line number.
 *
 * - Avoid using StackTraceGPS's "enhanced function name", because it's buggy.
 *
 * note
 *  StackTraceGPS does a lot of good work. So if the function name enhancing could be disabled,
 *    we could just use StackTrace.fromError().
 */
export const parseTraceAndSourceMap = (stack: UnparsedStack) => {
  const gps = new StackTraceGPS();

  const frames = ErrorStackParser.parse({
    stack: stack.stack,
  } as Error);

  if (isNode()) {
    //quick fix: To avoid XHR in tests.
    return Promise.resolve<ParsedStackFrame[]>(
      frames.map((elm) => ({
        line: elm.lineNumber,
        file: elm.fileName,
        func: elm.functionName,
      }))
    );
  }

  return Promise.all<ParsedStackFrame>(
    frames.map((frame) =>
      gps.pinpoint(frame).then((res: StackFrame) => ({
        line: res.lineNumber,
        file: res.fileName,
        func: frame.functionName,
      }))
    )
  );
};

/**
 *
 * note
 *  - It's hacky, but sleeping a bit, makes it more likely, that the message is rendered, and not waiting for the
 *    stack to be ready. It's not a problem on the first parse. In other words, it only
 *    happens, when StackTrace use cached source map.
 */
export const parseTraceAndSourceMapOld = (stack: UnparsedStack) =>
  sleeping(10).then(() =>
    StackTrace.fromError({
      stack: stack.stack,
    } as Error).then((frames) =>
      frames.map((elm) => ({
        line: elm.lineNumber,
        file: elm.fileName,
        func: elm.functionName,
      }))
    )
  );

/**
 *
 */
export const parseNodeTrace = (stack: string) => {
  //note parse can't be call alone, it must have 'this === StackTrace'
  const trace = NodeStackTrace.parse({ stack } as any);

  return trace.map((frame) => {
    // compose

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

    //return

    return {
      line: frame.getLineNumber(),
      file: frame.getFileName(),
      func,
    };
  });
};
