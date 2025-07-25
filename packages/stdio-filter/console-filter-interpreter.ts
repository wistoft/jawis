import { assert, assertNever } from "^jab";

import { makeAnsiParser } from "./internal";

/**
 * Interpret stdio with ansi codes into lines.
 *
 * - onStdio callback is called with individual lines, making it easy to handle the stdio stream.
 *    - newlines are not included in the lines given to onStdio.
 * - ANSI codes are interpreted, so only styling is emitted in the lines.
 * - ANSI codes can result in updates to lines. In that case the full line is emitted again.
 * - Carriage return is filtered out, because it has special meaning in the console.
 * - Lines are zero index'ed.
 *
 * todo
 *  drop lines, when buffer becomes too big.
 *
 */
export const makeStdioInterpreter = (
  onLine: (lineNumber: number, line: string, buffer: string[]) => void
) => {
  let indexX = 0;
  let indexY = 0;
  const buffer: string[] = [];

  const parser = makeAnsiParser({
    onPrint: (str) => {
      assert(str.indexOf("\n") === -1);

      const prev = buffer[indexY] ?? "";

      buffer[indexY] =
        prev.slice(0, indexX) + str + prev.slice(indexX + str.length);

      indexX += str.length;

      onLine(indexY, buffer[indexY], buffer);
    },
    onAction: (action, _count) => {
      switch (action) {
        case "up":
        case "down":
        case "right":
        case "left":
        case "up-beginning":
          throw new Error("not impl");

        case "down-beginning":
          indexX = 0;
          indexY++;

          if (buffer[indexY] === undefined) {
            buffer[indexY] = "";
          }

          onLine(indexY, buffer[indexY], buffer);
          break;

        default:
          return assertNever(action);
      }
    },
    onAction2: (action) => {
      switch (action) {
        case "erase-to-beginning":
          buffer[indexY] = buffer[indexY].slice(indexX); //todo: + || - 1 ??

          indexX = 0;

          onLine(indexY, buffer[indexY], buffer);
          break;

        default:
          return assertNever(action);
      }
    },
    setPosition: (cursorX, cursorY) => {
      indexX = cursorX - 1;

      if (cursorY !== undefined) {
        indexY = cursorY - 1;
      }
    },
  });

  return (str: string) => {
    parser.parse(str);
  };
};
