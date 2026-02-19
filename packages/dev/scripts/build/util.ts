import assert from "assert";
import copyfiles from "copyfiles";

/**
 * Make copyfiles use promise.
 */
export const copyingFiles = (paths: any, options: any) =>
  new Promise<void>((res, rej) => {
    const callback = (err: any) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    };

    if (options) {
      copyfiles(paths, options, callback);
    } else {
      copyfiles(paths, callback);
    }
  });

/**
 *
 */
export const sortObject = (obj: any) => {
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));

  const res: any = {};

  for (const key of keys) {
    res[key] = obj[key];
  }

  return res;
};

/**
 *
 *
 */
export const emitVsCodeError = (deps: {
  file: string;
  message: string;
  line?: number | string;
  column?: string;
  severity?: "error" | "warning";
}) => {
  assert(!deps.file.includes("\n"));

  assert(!deps.message.includes("\n"));
  assert(typeof deps.line !== "string" || !deps.line.includes("\n"));
  assert(typeof deps.column !== "string" || !deps.column.includes("\n"));
  assert(typeof deps.severity !== "string" || !deps.severity.includes("\n"));

  const line = deps.line ?? 1;
  const column = deps.column ?? 1;
  const severity = deps.severity ?? "error";

  console.log( deps.message + " - " + severity + " - " + deps.file + ":" + line + ":" + column ); // prettier-ignore
};
