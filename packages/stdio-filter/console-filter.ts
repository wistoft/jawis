import {
  MakeIncludeLineDeps,
  MakeMapLineDeps,
  makeIncludeLine,
  makeMapLine,
  makeStdioLinearizer_old,
} from "./internal";

/**
 *
 */
export const makeStdioFilter = (
  deps: MakeIncludeLineDeps &
    MakeMapLineDeps & {
      streamOutput: (str: string) => void;
      onLineShown: (str: string) => void;
      mapLineBeforeOutput?: (line: string) => string;
      timeout: number;
      emitDotForIgnoredLines?: boolean;
    }
) => {
  const mapLine = makeMapLine(deps);

  //make include line

  const includeLine = makeIncludeLine(deps);

  //outputter

  let previousWasDot = false;

  const outputLine = (rawLine?: string) => {
    if (rawLine) {
      let line = mapLine(rawLine);

      //map line before output

      if (deps.mapLineBeforeOutput) {
        line = deps.mapLineBeforeOutput(line);
      }

      deps.onLineShown(line);

      if (previousWasDot) {
        deps.streamOutput("\n");
      }
      deps.streamOutput(line);

      previousWasDot = false;
    } else if (
      deps.emitDotForIgnoredLines === undefined ||
      deps.emitDotForIgnoredLines
    ) {
      deps.streamOutput(".");

      previousWasDot = true;
    }
  };

  return makeStdioLinearizer_old(outputLine, includeLine, deps.timeout);
};
