import { SendBeeLog } from "^bee-common";
import { unknownToErrorData } from "^jab";

/**
 *
 */
export const makeOnError =
  (send: SendBeeLog) =>
  (error: any, extraInfo: Array<unknown> = []) => {
    const errorData = unknownToErrorData(error, extraInfo);

    send({
      type: "error",
      data: errorData,
    });
  };
