import { ErrorEntry } from "^jab";
import { parseErrorData, parseTraceAndSourceMap } from "^parse-captured-stack";

import {
  ConsoleEntry,
  UiEntry,
  UiErrorEntry,
  State,
  mapConsoleEntry,
  preserveConsoleEntry,
} from "./internal";

/**
 *
 */
export const makeAddDataUpdater = (
  entries: ConsoleEntry[],
  makeReactKey: () => number,
  doSourceMap: boolean
) => {
  const asyncs: Promise<(old: State) => State>[] = [];

  const newEntries = entries
    .filter(preserveConsoleEntry)
    .map((tmp): UiEntry => {
      const entry = mapConsoleEntry(tmp);

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

      if (entry.type === "stream") {
        return { id: makeReactKey(), ...entry, data: entry.data.toString() };
      }

      return { id: makeReactKey(), ...entry };
    });

  const sync = (old: State): State => ({
    ...old,
    logs: mergeOldAndNewLogs(old.logs, newEntries),
  });

  return { sync, asyncs };
};

/**
 * Combine adjacent stream entries, if they have the same context and logName.
 *
 *  - Only last entry in old log is considered, because existing logs should already be combined.
 *  - All adjacent entries on new entries are combined if possible.
 */
export const mergeOldAndNewLogs = (old: UiEntry[], entries: UiEntry[]) => {
  const res = [...old];

  let latest = res[res.length - 1];

  for (const cur of entries) {
    if (
      latest?.type === "stream" &&
      latest.context === cur.context &&
      latest.logName === cur.logName
    ) {
      const combined = { ...latest, data: latest.data + cur.data };

      res[res.length - 1] = combined; //we may mutate here, because it's a clone.
      latest = combined;
    } else {
      res.push(cur);
      latest = cur;
    }
  }

  return res;
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
        (parsedStack) =>
          (old): State => ({
            ...old,
            logs: old.logs.map((entry): UiEntry => {
              if (entry.id === id && entry.type === "error") {
                return { ...entry, data: { ...entry.data, parsedStack } };
              } else {
                return entry;
              }
            }),
          })
      ),
    };
  } else {
    return {
      sync: {
        id: makeReactKey(),
        ...entry,
        data: parseErrorData(entry.data),
      },
    };
  }
};
