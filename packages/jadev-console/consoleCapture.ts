import { unknownToErrorData } from "^jab";

import { CaptureCache } from ".";
import { createConsoleFunction } from "./util";

/**
 * - Intercept "console data"
 * - Install at module load, so the most information is captured.
 * - Store the captured data in a global variable, so it can be retrieved by someone else.
 * - Notify on change, so the consumer can do what is appropriate.
 * - Agnostic to when and how the captured data is used.
 *
 * Note
 *  Can't use console.log or throw errors. It will cause infinite loop.
 */
export const consoleCapture = (windowProperty = "__JadevConsoleCapture") => {
  //
  // create hacky global variable.
  //

  const captureCache: CaptureCache = {
    data: [],
  };

  (window as any)[windowProperty] = captureCache;

  //
  // console
  //

  console.error = createConsoleFunction(captureCache, "error", "browser");
  console.warn = createConsoleFunction(captureCache, "warn", "browser");
  console.log = createConsoleFunction(captureCache, "log", "browser");
  console.info = createConsoleFunction(captureCache, "info", "browser");

  //
  // errors
  //

  window.addEventListener(
    "error",
    (event) => {
      captureCache.data.push({
        type: "error",
        context: "browser",
        data: unknownToErrorData(event.error, []),
      });
      captureCache.onChange && captureCache.onChange();
    },
    true //true for capture
  );

  //
  // promises
  //

  window.addEventListener("unhandledrejection", (event) => {
    captureCache.data.push({
      type: "error",
      context: "browser",
      data: unknownToErrorData(event.reason, ["uh-exception"]),
    });
    captureCache.onChange && captureCache.onChange();
  });
};
