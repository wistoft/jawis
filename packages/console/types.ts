import { CapturedValue, ParsedStack } from "^jab";
import { HtmlEntry, JagoLogEntry, LogEntry } from "^bee-common";

//
// console entries - the input data
//

export type ConsoleEntry = JagoLogEntry & {
  context: string;
};

//
// UI entries - data stored in state
//

//ensured, that each entry has exactly one line.
//Meaning all entries end on newline. Except the last, that may not.
export type StreamLineEntry = {
  type: "stream-line";
  data: string;
  logName?: string;
  context: string;
};

export type UiErrorEntry = {
  type: "error";
  data: {
    msg: string;
    info: Array<CapturedValue>;
    parsedStack?: ParsedStack;
  };
  logName?: string;
} & {
  id: number;
  context: string;
  expandEntry?: boolean;
};

export type UiEntry =
  | UiErrorEntry
  | ((LogEntry | HtmlEntry | StreamLineEntry) & {
      id: number;
      context: string;
      expandEntry?: boolean;
    });

//
// global accessible data
//

export type CaptureCache = {
  data: ConsoleEntry[];
  onChange?: () => void;
};
