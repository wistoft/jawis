import { ClonedValue } from ".";

export type UnparsedStack = {
  type: "node" | "other";
  stack?: string;
};

export type ParsedStackFrame = {
  line?: number;
  file?: string;
  func?: string;
};

export type ParsedStack = ParsedStackFrame[];

export type ErrorData = {
  msg: string;
  info: Array<ClonedValue>;
  stack: UnparsedStack;
};

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
