import { captureArrayEntries } from "^jab";

import { CaptureCache, ConsoleEntry } from "./internal";

/**
 *
 */
export const createConsoleFunction = (
  captureCache: CaptureCache,
  logName: "error" | "warn" | "log" | "info",
  context: string
) => {
  const originalFunction = console[logName];

  return (...entry: unknown[]) => {
    originalFunction(...entry);
    captureCache.data.push({
      type: "log",
      logName,
      context,
      data: captureArrayEntries(entry),
    });
    captureCache.onChange && captureCache.onChange();
  };
};

/**
 *
 */
export const preserveConsoleEntry = (entry: ConsoleEntry) => {
  if (entry.type === "log" && entry.logName === "error") {
    const firstArg = entry.data[0];

    // this provide the component stack, but that should be possible to get some where else.
    if (
      typeof firstArg === "string" &&
      /^The above error occurred in/.test(firstArg)
    ) {
      return false;
    }

    //this is also thrown as an error, so this message gives nothing.

    if (
      typeof firstArg === "string" &&
      /Warning: React\.createElement: type is invalid -- expected a string \(for built-in components\) or a class\/function \(for composite components\) but got: %s\.%s%s/.test(
        firstArg
      )
    ) {
      return false;
    }
  }

  return true;
};

/**
 *
 */
export const mapConsoleEntry = (entry: ConsoleEntry): ConsoleEntry => {
  if (entry.type === "error") {
    const msg = entry.data.msg
      .replace(/^Error: /, "")
      .replace(
        /Element type is invalid: expected a string \(for built-in components\) or a class\/function \(for composite components\) but got: undefined\. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports\.\n\nCheck the render method of `(.*)`\./,
        "$1 rendered to invalid value."
      );

    return { ...entry, data: { ...entry.data, msg } };
  }

  return entry;
};
