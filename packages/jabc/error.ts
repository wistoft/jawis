import { ClonedValue } from ".";

export type UnparsedStack =
  | {
      type: "node" | "other";
      stack: string;
    }
  | {
      type: "node-parsed";
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
  info: Array<ClonedValue>;
  stack: UnparsedStack;
};

export type ParsedErrorData = {
  msg: string;
  info: Array<ClonedValue>;
  parsedStack?: ParsedStack;
};

export type ErrorReporter = (error: unknown, info?: Array<unknown>) => void;
