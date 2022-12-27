import { FinallyProvider } from "^finally-provider";
import {
  captureArrayEntries,
  err,
  LogProv,
  OnError,
  unknownToErrorData,
} from "^jab";
import { JagoSend } from "./types";

/**
 *
 */
export const makeJagoOnError =
  (sendImpl: JagoSend): OnError =>
  (error, extraInfo) => {
    sendImpl({
      type: "error",
      data: unknownToErrorData(error, extraInfo),
    });
  };

/**
 * - sendImpl is needed for testing.
 */
export const mainProvToJago = (sendImpl: JagoSend, logPrefix = "") => {
  const onError = makeJagoOnError(sendImpl);
  const finalProv = new FinallyProvider({ onError });
  const logProv = makeJagoLogProv(sendImpl, logPrefix);

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
export const makeJagoLogProv = (
  sendImpl: JagoSend,
  logPrefix = ""
): LogProv => ({
  log: (...args) =>
    sendImpl({
      type: "log",
      data: captureArrayEntries(args),
      logName: logPrefix,
    }),
  logStream: (type, data) =>
    sendImpl({
      type: "stream",
      data: typeof data === "string" ? data : data.toString(),
      logName: logPrefix ? logPrefix + type : type,
    }),
  status: () => {
    err("not impl");
  },
});
