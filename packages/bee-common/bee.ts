import { FinallyProvider } from "^finally-provider";
import {
  captureArrayEntries,
  err,
  LogProv,
  OnError,
  unknownToErrorData,
} from "^jab";
import { SendBeeLog } from "./internal";

/**
 *
 */
export const makeBeeOnError =
  (sendLog: SendBeeLog): OnError =>
  (error, extraInfo) => {
    sendLog({
      type: "error",
      data: unknownToErrorData(error, extraInfo),
    });
  };

/**
 *
 */
export const makeMainBeeProv = (sendLog: SendBeeLog, logPrefix = "") => {
  const onError = makeBeeOnError(sendLog);
  const finalProv = new FinallyProvider({ onError });
  const logProv = makeBeeLogProv(sendLog, logPrefix);

  return {
    onError,
    finalProv,
    finally: finalProv.finally,
    logProv,
    log: logProv.log,
    logStream: logProv.logStream,
  };
};

/**
 *
 */
export const makeBeeLogProv = (
  sendLog: SendBeeLog,
  logPrefix = ""
): LogProv => ({
  log: (...args) =>
    sendLog({
      type: "log",
      data: captureArrayEntries(args),
      logName: logPrefix,
    }),
  logStream: (type, data) =>
    sendLog({
      type: "stream",
      data: typeof data === "string" ? data : data.toString(),
      logName: logPrefix ? logPrefix + type : type,
    }),
  status: () => {
    err("makeBeeLogProv.status: not impl");
  },
});
