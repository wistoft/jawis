import { SendLog, unknownToErrorData, hasProp, ErrorData, assert } from "^jab";
import { parseTraceAndSourceMap } from "^parse-captured-stack";

/**
 *
 */
export const makeOnError =
  (send: SendLog) =>
  (error: any, extraInfo: Array<unknown> = []) => {
    if (hasProp(error, "getAggregateErrors")) {
      assert(extraInfo.length === 0);

      error.getAggregateErrors().map((data: ErrorData) =>
        send({
          type: "error",
          data,
        })
      );
    } else {
      const errorData = unknownToErrorData(error, extraInfo);

      //do source map, because we don't know if the error will be presented in this environment.

      parseTraceAndSourceMap(errorData.stack).then((stack) => {
        send({
          type: "error",
          data: { ...errorData, stack: { type: "parsed", stack } },
        });
      });
    }
  };
