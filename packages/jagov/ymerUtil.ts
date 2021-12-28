import {
  unknownToErrorData,
  cloneArrayEntries,
  hasProp,
  ErrorData,
  JagoSend,
} from "^jab";
import { parseTraceAndSourceMap } from "^util-javi/web";

/**
 *
 */
export const monkeyPatchConsoleFunction = (
  send: JagoSend,
  logName: "error" | "warn" | "log" | "info"
) => {
  const originalFunction = console[logName];

  console[logName] = (...entry: unknown[]) => {
    send({
      type: "log",
      logName: "console." + logName,
      data: cloneArrayEntries(entry),
    });
  };

  (console[logName] as any).original = originalFunction;
};

/**
 * minder meget om: makeJagoOnError
 */
export const makeOnError = (send: JagoSend) => (error: any) => {
  if (hasProp(error, "getAggregateErrors")) {
    //quick fix - should use a convention `unknownToErrorData` understands.
    error.getAggregateErrors().map((data: ErrorData) =>
      send({
        type: "error",
        data,
      })
    );
  } else {
    const errorData = unknownToErrorData(error);

    //do source map, because we don't know if the error will be presented in this environment.

    parseTraceAndSourceMap(errorData.stack).then((stack) => {
      send({
        type: "error",
        data: { ...errorData, stack: { type: "node-parsed", stack } },
      });
    });
  }
};
