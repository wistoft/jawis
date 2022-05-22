import ErrorStackParser from "error-stack-parser";
import StackTrace, { StackFrame } from "stacktrace-js";
import StackTraceGPS from "stacktrace-gps";

import {
  assertNever,
  ErrorData,
  isNode,
  ParsedErrorData,
  ParsedStackFrame,
  sleeping,
  CapturedStack,
} from "^jab";
import { parseNodeTrace } from "^util-javi";

//duplicated
export const filterErrorMessage = (msg: string) => msg.replace(/^Error: /, "");

/**
 * Produce a parsed stack for ViewException component.
 */
export const parseErrorData = (error: ErrorData): ParsedErrorData => {
  try {
    return {
      ...error,
      parsedStack: parseTrace(error.stack),
    };
  } catch (e) {
    console.log(e);
    console.log(error);
    return {
      msg: error.msg,
      info: [],
      parsedStack: [],
    };
  }
};

/**
 *
 * - parse node stack traces with node-stack-trace, because error-stack-parser is buggy.
 *
 *
 * note
 *  error-stack-parser has a lot of logic for Opera, but it's outdated. Current Opera
 *    uses v8 format. So there's no need to think about capturing anything but the
 *    `error.stack` property. It will work for all (modern) browsers and node.
 */
export const parseTrace = (stack: CapturedStack): ParsedStackFrame[] => {
  if (stack.stack === undefined || stack.stack === "") {
    //error-stack-parser can't handle this case
    return [];
  }

  switch (stack.type) {
    case "node":
      return parseNodeTrace(stack.stack);

    case "node-parsed":
      return stack.stack;

    case "other":
      return ErrorStackParser.parse({
        stack: stack.stack,
      } as Error).map((elm) => ({
        line: elm.lineNumber,
        file: elm.fileName,
        func: elm.functionName,
      }));

    default:
      return assertNever(stack);
  }
};

/**
 * parse and use source map to find original file and line number.
 *
 * - source map assumes browser environment, and the error was thrown in this browser.
 *
 * impl
 *  Avoids using StackTraceGPS's "enhanced function name", because it's buggy.
 *
 * note
 *  StackTraceGPS does a lot of good work. So if the function name enhancing could be disabled,
 *    we could just use StackTrace.fromError().
 */
export const parseTraceAndSourceMap = (stack: CapturedStack) => {
  switch (stack.type) {
    case "node":
      throw new Error("Can only source map errors from the browser.");

    case "node-parsed":
      return Promise.resolve(stack.stack);

    case "other":
      return parseTraceAndSourceMapReal(stack);

    default:
      return assertNever(stack);
  }
};

/**
 * Handles the errors, that are from a browser.
 */
export const parseTraceAndSourceMapReal = (stack: CapturedStack) => {
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

  //quick fix when running in worker, because gps uses `window.atob`
  if (typeof window === "undefined") {
    (self.window as any) = self;
  }

  return Promise.all<ParsedStackFrame>(
    frames.map((frame) =>
      gps
        .pinpoint(frame)
        .then((res: StackFrame) => ({
          line: res.lineNumber,
          file: res.fileName,
          func: frame.functionName,
        }))
        .catch((error: any) => {
          //no source map isn't a fatal error, so we squash.
          if (error?.message !== "sourceMappingURL not found") {
            console.log("parseTraceAndSourceMapReal: " + error?.message);
          }

          //use the raw info from input as fallback.
          return {
            line: frame.lineNumber,
            file: frame.fileName,
            func: frame.functionName,
          };
        })
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
export const parseTraceAndSourceMapOld = (stack: CapturedStack) =>
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
