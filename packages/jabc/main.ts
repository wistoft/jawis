import { OnError, OnErrorData } from "./internal";

//
//covenience: duplicates some properties to be compatible with TestMainProv
//

/**
 *
 */
export type LogProv = {
  /**
   * for logging javascript values.
   */
  log: (...args: Array<unknown>) => void;

  /**
   * for logging things like stdout.
   */
  logStream: (logName: string, value: string | Uint8Array) => void;

  /**
   * for reporting status.
   */
  status: (type: string, status: string) => void;
};

/**
 *
 */
export type FinallyProv = {
  isActive: () => boolean;
  finally: FinallyFunc;
  runFinally: () => Promise<void>;
};

export type FinallyFunc = (
  func: () => void | undefined | Promise<void>
) => void;

export type MainProv = {
  onError: OnError;
  onErrorData: OnErrorData;

  finalProv: FinallyProv;
  finally: FinallyProv["finally"]; //covenience

  logProv: LogProv;
  log: LogProv["log"]; //covenience
  logStream: LogProv["logStream"]; //covenience
};
