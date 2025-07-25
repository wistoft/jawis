import { assert } from "^jab";

import {
  makeIncludeLine,
  MakeIncludeLineDeps,
  makeMapLine,
  MakeMapLineDeps,
  makeStdioInterpreter,
  makeUpdateScreen,
  MakeUpdateScreenDeps,
} from "./internal";

type Deps = MakeIncludeLineDeps &
  MakeMapLineDeps &
  MakeUpdateScreenDeps & {
    onLineShown: (str: string) => void;
    mapLineBeforeOutput?: (line: string) => string;
  };

/**
 *
 *
 */
export const makeStdioFilterNew = (deps: Deps) => {
  //deps

  const mapLine = makeMapLine(deps);
  const includeLine = makeIncludeLine(deps);
  const updateScreen = makeUpdateScreen(deps);

  //outputter

  const onLine = (lineNumber: number, rawLine: string, buffer: string[]) => {
    assert(rawLine.indexOf("\n") === -1);

    const include = includeLine(rawLine);

    let newLine = mapLine(rawLine);

    //map line before output

    if (deps.mapLineBeforeOutput) {
      newLine = deps.mapLineBeforeOutput(newLine);
    }

    if (include && newLine !== "") {
      deps.onLineShown(newLine);
    }

    //lines

    const shown = [];
    const lastShown = false;

    for (const rawLine of buffer) {
      const include = includeLine(rawLine);

      if (!include) {
        continue;
      }

      let line = mapLine(rawLine);

      //map line before output

      if (deps.mapLineBeforeOutput) {
        line = deps.mapLineBeforeOutput(line);
      }

      if (line === "" && !lastShown) {
        continue;
      }

      shown.push(line);
    }

    //render

    updateScreen(shown);
  };

  return makeStdioInterpreter(onLine);
};
