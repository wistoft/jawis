import ErrorStackParser from "error-stack-parser";
import StackTrace from "stacktrace-js";
import { ErrorData, ParsedErrorData, sleeping } from "^jab";

export const filterErrorMessage = (msg: string) => msg.replace(/^Error: /, "");

/**
 * Produce a parsed stack for ViewException component.
 */
export const parseErrorData = (error: ErrorData): ParsedErrorData => ({
  ...error,
  parsedStack: parseBacktrace(error.stack),
});

/**
 *
 * note
 *  error-stack-parser has a lot of logic for Opera, but it's outdated. Current Opera
 *    use v8 format. So there is no need to think about capturing anything but the
 *    `error.stack` property. It will work for all (modern) browsers and node.
 */
export const parseBacktrace = (stack?: string) => {
  if (!stack) {
    //error-stack-parser can't handle this case
    return [];
  }

  return ErrorStackParser.parse({
    stack,
  } as Error).map((elm) => ({
    line: elm.lineNumber,
    file: elm.fileName,
    func: elm.functionName,
  }));
};

/**
 *
 * - It's hacky, but sleeping a bit, makes it more likely, that the message is rendered, and not waiting for the
 *    stack to be ready. It's not a problem on the first parse. In other words, it only
 *    happens, when StackTrace use cached source map.
 */
export const parseBacktraceAndSourceMap = (stack?: string) =>
  sleeping(10).then(() =>
    StackTrace.fromError({
      stack,
    } as Error).then((frames) =>
      frames.map((elm) => ({
        line: elm.lineNumber,
        file: elm.fileName,
        func: elm.functionName,
      }))
    )
  );
