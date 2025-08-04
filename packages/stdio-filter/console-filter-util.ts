import { assert, def } from "^jab";

/**
 *
 * - onStdio callback is called with each line, making it easy to handle the stdio stream.
 *    - newline is not included in the line given to onStdio.
 * - onStdio callback is called with undefined, when the line is fully filtered.
 * - If a partial line is received, it might be emitted without filtering.
 * - timeout tells when buffered data is emitted, if it hasn't been terminated by a newline.
 * - If timeout is 0, flush will be performed sync. (useful for testing)
 *
 * impl
 *  - By ensuring we can handle re-entry for async cases, we ensure all async workloads are handled.
 *      It's a slightly stricter constraint, but it makes writing test cases easier, because they are sync,
 *        and any async sequence can be simulated that way.
 *      re-entry isn't that important to support. Async consistency is a must, however.
 *      That's why sync re-entry isn't implemented.
 *
 * states
 *  state 1: No buffered data and no active timeout handle.
 *  state 2: Buffered data and active timeout handle.
 *  state 3: Partial emitted and no active timeout handle.
 */
export const makeStdioLinearizer_old = (
  onStdio: (str?: string) => void,
  includeLine: (str: string) => boolean,
  timeout = -1
) => {
  let buffer = "";
  let handle: any;
  let partialEmitted = false;

  return (data: Buffer | string) => {
    partialEmitted && assert(buffer === "");

    //use buffer from previous data

    const str = buffer + data.toString();

    buffer = "";

    const lines = str.split("\n");

    //previous partial lines

    if (partialEmitted) {
      assert(handle === undefined);

      if (!str.includes("\n")) {
        //we just emit the new partial str. And remain in this state.
        onStdio(str);
        return;
      } else {
        assert(lines.length > 1);

        partialEmitted = false;

        const justOneLine = str.endsWith("\n") && lines.length === 2;

        if (justOneLine) {
          onStdio(str);
          return; //have to return. Below wouldn't expect this case.
        } else {
          //emit line without checking if line should be ignored.

          const first = lines.shift();
          onStdio(first + "\n");

          //we leave the rest to below. It's guaranteed there are lines left in the array.
        }
      }
    }

    //handle partial lines

    if (!str.endsWith("\n")) {
      //without newline, we can't determine if line should be ignored yet.

      buffer = def(lines.pop());

      //set timer, if not already set. And the timeout parameter tells us to.

      if (timeout >= 0 && handle === undefined) {
        handle = setTimeout(() => {
          //must be done first, so a new timer is set, in case of re-entry.

          handle = undefined;

          //output

          if (includeLine(buffer)) {
            partialEmitted = true;
            const tmp = buffer;
            buffer = ""; //must be done before call to external, so the state is correct for possible re-entry.
            onStdio(tmp);
          } else {
            //we don't need to output a pseudo line, because the 'partial line' is ignored.
          }
        }, timeout);
      }
    } else {
      //cancel the timer. It's not needed anymore.

      if (handle) {
        clearTimeout(handle);
        handle = undefined;
      }

      //the final newline gives a meaningless empty string, which must be ignored.

      def(lines.pop());
    }

    //output

    for (const line of lines) {
      if (includeLine(line)) {
        //This can also cause re-entry. But that will only cause the stdio lines to be out of order.
        onStdio(line + "\n");
      } else {
        onStdio();
      }
    }
  };
};

/**
 *
 */

export type MakeMapLineDeps = {
  ignoreLiteralPrefixes?: string[];
  mapLineBeforeFilter?: (line: string) => string;
};

export const makeMapLine = (deps: MakeMapLineDeps) => {
  const actualIgnoreLiteralPrefixes = (deps.ignoreLiteralPrefixes || []).filter(
    (prefix) => prefix !== ""
  );

  return (line: string) => {
    //map before filter

    if (deps.mapLineBeforeFilter) {
      line = deps.mapLineBeforeFilter(line);
    }

    //remove prefixes

    return actualIgnoreLiteralPrefixes.reduce<string>((accLine, prefix) => {
      const index = accLine.indexOf(prefix);

      if (index !== 0) {
        return accLine;
      } else {
        return accLine.slice(prefix.length);
      }
    }, line);
  };
};

/**
 *
 */
export type MakeIncludeLineDeps = {
  ignoreLiteralLines?: string[];
  includeLine?: (line: string) => boolean;
  includeJson?: (obj: any) => boolean;
} & MakeMapLineDeps;

export const makeIncludeLine = (deps: MakeIncludeLineDeps) => {
  const actualIgnoreLiteralLines = (deps.ignoreLiteralLines || [])
    .map(replaceForCompare)
    .filter((line) => line !== "");

  const mapLine = makeMapLine(deps);

  return (rawLine: string) => {
    //remove prefixes

    const line = mapLine(rawLine);

    //evaluated include

    if (actualIgnoreLiteralLines.includes(replaceForCompare(line))) {
      return false;
    }

    if (deps.includeLine && !deps.includeLine(line)) {
      return false;
    }

    if (deps.includeJson && line.match(/^\s*{/) !== null) {
      try {
        const obj = JSON.parse(line);

        return deps.includeJson(obj);
      } catch (error) {
        //just ignore
      }
    }

    return true;
  };
};

const replaceForCompare = (line: string) =>
  line.replace(/\d+/g, "").replace(/\r/g, "").trim();
