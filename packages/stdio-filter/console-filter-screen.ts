import { assert } from "^jab";

export type MakeUpdateScreenDeps = {
  streamOutput: (str: string) => void;
};

/**
 *
 */
export const makeUpdateScreen = (deps: MakeUpdateScreenDeps) => {
  let cursorPos = 0;
  const shown: string[] = [];

  const gotoAndClearLine = (lineNumber: number) => {
    const diff = lineNumber - cursorPos;

    //move up/down

    if (diff < 0) {
      deps.streamOutput("\x1B[" + -diff + "A");
    } else if (diff > 0) {
      deps.streamOutput("\x1B[" + diff + "B");
    }

    //erase line

    deps.streamOutput("\x1B[2K");

    //goto start of line

    deps.streamOutput("\x1B[1G");

    //done

    cursorPos = lineNumber;
  };

  const outputLine = (lineNumber: number, line: string) => {
    assert(line.indexOf("\n") === -1);

    gotoAndClearLine(lineNumber);

    deps.streamOutput(line);

    shown[lineNumber] = line;
  };

  return (lines: string[]) => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (shown[i] !== line) {
        outputLine(i, line);
      }
    }

    // clear old lines, not used anymore.

    const count = shown.length - lines.length;

    for (let i = 0; i < count; i++) {
      gotoAndClearLine(lines.length + i);
    }
  };
};
