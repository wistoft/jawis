import { State, UiEntry } from "^console";
import { cloneArrayEntries } from "^jab";

import { errorData1, errorData2 } from ".";

export const defaultConsoleState: State = { logs: [] };

export const uiEntries: UiEntry[] = [
  {
    id: 1,
    type: "log",
    context: "browser",
    logName: "log",
    data: [],
  },
  {
    id: 2,
    type: "log",
    context: "browser",
    logName: "error",
    data: cloneArrayEntries([{ hej: 1, dav: true, hi: [1, 2, 3] }]),
  },
  {
    id: 3,
    type: "error",
    context: "browser",
    data: errorData1,
  },
  {
    id: 4,
    type: "error",
    context: "browser",
    data: errorData2,
  },
];
