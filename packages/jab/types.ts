import { ClonedValue } from ".";

export type ErrorData = {
  msg: string;
  info: Array<ClonedValue>;
  stack?: string;
};

export type ParsedStack = {
  line?: number;
  file?: string;
  func?: string;
}[];

export type ParsedErrorData = {
  msg: string;
  info: Array<ClonedValue>;
  parsedStack?: ParsedStack;
};

export type ErrorReporter = (error: unknown, info?: Array<unknown>) => void;

/**
 *
 */
export type LogProv = {
  /**
   * for logging javascript variables.
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
  finally: FinallyFunc;
  runFinally: () => Promise<void>;
};

export type FinallyFunc = (
  func: () => void | undefined | Promise<void>
) => void;

//
// not found in official places
//

export interface Json {
  [x: string]: string | number | boolean | Date | Json | JsonArray | undefined;
}

type JsonArray = Array<string | number | boolean | Date | Json | JsonArray>;
