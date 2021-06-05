import { ErrorEntry } from "^jagoc";
import { parseTrace, parseTraceAndSourceMap } from "^util-javi/web";
import { ConsoleEntry, UiEntry, UiErrorEntry } from "./types";
import { State } from "./useConsoleState";
import { mapConsoleEntry, preserveConsoleEntry } from "./util";

/**
 *
 */
export const makeAddDataUpdater = (
  entries: ConsoleEntry[],
  makeReactKey: () => number,
  doSourceMap: boolean
) => {
  const asyncs: Promise<(old: State) => State>[] = [];

  const newEntries = entries.filter(preserveConsoleEntry).map(
    (tmp): UiEntry => {
      const entry = mapConsoleEntry(tmp);

      if (entry.type === "stream") {
        let filtered = entry.data;

        if (entry.logName === "stdout") {
          filtered = entry.data.replace(
            "(electron) Sending uncompressed crash reports is deprecated and will be removed in a future version of Electron. Set { compress: true } to opt-in to the new behavior. Crash reports will be uploaded gzipped, which most crash reporting servers support.",
            "[electron filtered]"
          );
        }

        //quick fix - these should be properly linearized.
        return {
          id: makeReactKey(),
          ...entry,
          type: "stream-line",
          data: filtered,
        };
      }

      if (entry.type === "error") {
        const { sync, async } = getErrorLogUpdateHelper(
          entry,
          makeReactKey,
          doSourceMap
        );

        if (async) {
          asyncs.push(async);
        }

        return sync;
      }

      return { id: makeReactKey(), ...entry };
    }
  );

  const sync = (old: State): State => ({
    ...old,
    logs: [...old.logs, ...newEntries],
  });

  return { sync, asyncs };
};

/**
 *
 */
export const getErrorLogUpdateHelper = (
  entry: ErrorEntry & {
    context: string;
  },
  makeReactKey: () => number,
  doSourceMap: boolean
): { sync: UiErrorEntry; async?: Promise<(old: State) => State> } => {
  if (doSourceMap) {
    const id = makeReactKey();

    const syncEntry = {
      id,
      ...entry,
      data: {
        msg: entry.data.msg,
        info: entry.data.info,
      },
    };

    return {
      sync: syncEntry,
      async: parseTraceAndSourceMap(entry.data.stack).then(
        (parsedStack) => (old): State => ({
          ...old,
          logs: old.logs.map(
            (entry): UiEntry => {
              if (entry.id === id && entry.type === "error") {
                return { ...entry, data: { ...entry.data, parsedStack } };
              } else {
                return entry;
              }
            }
          ),
        })
      ),
    };
  } else {
    return {
      sync: {
        id: makeReactKey(),
        ...entry,
        data: {
          msg: entry.data.msg,
          info: entry.data.info,
          parsedStack: parseTrace(entry.data.stack),
        },
      },
    };
  }
};
