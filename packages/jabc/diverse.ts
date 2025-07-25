import { CapturedValue, ErrorData } from "./internal";

//
// logs
//

export type SendLog = (msg: LogEntry) => void;

export type ValueEntry = {
  type: "log"; //todo: rename to value
  data: CapturedValue[];
  logName?: string;
};

export type StreamEntry = {
  type: "stream";
  data: string | Buffer;
  logName?: string;
};

export type StatusEntry = {
  type: "status";
  data: string;
  logName?: string;
};

export type HtmlEntry = {
  type: "html";
  data: string;
  logName?: string;
};

export type ErrorEntry = {
  type: "error";
  data: ErrorData;
  logName?: string;
};

export type LogEntry =
  | ValueEntry
  | StreamEntry
  | StatusEntry
  | HtmlEntry
  | ErrorEntry;

//
// files
//

export type HandleOpenFileInEditor = (
  location: {
    file: string;
    line?: number;
  },
  baseFolder?: string
) => void;

export type CompareFiles = (file1: string, file2: string) => void;

export type FileService = {
  handleOpenFileInEditor: HandleOpenFileInEditor;
  handleOpenRelativeFileInEditor: HandleOpenFileInEditor;
  compareFiles: CompareFiles;
};

export type CompileService = {
  load: (absPath: AbsoluteFile) => Promise<string>;
};

export type AbsoluteFile = string & {
  type: "absolute-file";
};

export type CanonicalFile = string & {
  type: "canonical-file";
};
