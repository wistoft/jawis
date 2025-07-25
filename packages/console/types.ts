import {
  CapturedValue,
  ParsedStack,
  HtmlEntry,
  LogEntry,
  ValueEntry,
  StatusEntry,
} from "^jab";

//
// console entries - the input data
//

export type ConsoleEntry = LogEntry & {
  context: string;
};

//
// UI entries - data stored in state
//

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

export type UiStreamEntry = {
  type: "stream";
  data: string;
  logName?: string;
};

export type UiEntry =
  | UiErrorEntry
  | ((ValueEntry | StatusEntry | HtmlEntry | UiStreamEntry) & {
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
