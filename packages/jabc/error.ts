import { CapturedValue } from ".";

export type OnError = (error: unknown, extraInfo?: Array<unknown>) => void;
export type OnErrorData = (error: ErrorData) => void;

export type CapturedStack =
  | {
      type: "node" | "other";
      stack: string;
    }
  | {
      type: "parsed";
      stack: ParsedStackFrame[];
    };

export type ParsedStackFrame = {
  line?: number;
  file?: string;
  func?: string;
  rawLine?: number;
  rawFile?: string;
};

export type ParsedStack = ParsedStackFrame[];

export type ErrorWithParsedNodeStack = Error & {
  __jawisNodeStack?: ParsedStackFrame[];
};

export type ErrorData = {
  msg: string;
  info: Array<CapturedValue>;
  stack: CapturedStack;
};

export type ParsedErrorData = {
  msg: string;
  info: Array<CapturedValue>;
  parsedStack?: ParsedStack;
};

export type ErrorReporter = (error: unknown, info?: Array<unknown>) => void;
