const assert = require("assert");
const copyfiles = require("copyfiles");

/**
 * Make copyfiles use promise.
 */
const copyingFiles = (paths, options) =>
  new Promise((res, rej) => {
    const callback = (err, val) => {
      if (err) {
        rej(err);
      } else {
        res(val);
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
const sortObject = (obj) => {
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));

  const res = {};

  for (const key of keys) {
    res[key] = obj[key];
  }

  return res;
};

/**
 *
 *  {
      file: string;
      message: string;
      line?: number | string;
      column?: string;
      severity?: "error" | "warning";
    }
 */
const emitVsCodeError = (deps) => {
  assert(!deps.file.includes("\n"));

  assert(!deps.message.includes("\n"));
  assert(deps.line !== "string" || !deps.line.includes("\n"));
  assert(deps.column !== "string" || !deps.column.includes("\n"));
  assert(deps.severity !== "string" || !deps.severity.includes("\n"));

  const line = deps.line ?? 1;
  const column = deps.column ?? 1;
  const severity = deps.severity ?? "error";

  console.log( deps.message + " - " + severity + " - " + deps.file + ":" + line + ":" + column ); // prettier-ignore
};

//
// exports
//

module.exports = {
  copyingFiles,
  sortObject,
  emitVsCodeError,
};
