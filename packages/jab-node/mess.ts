import fs, { PathLike } from "fs";
import path from "path";

import { assertString, undefinedOr, isInt } from "^jab";

import { execSilent, execSyncAndGetStdout } from ".";

/**
 *
 */
export const ensureMkdirSync = (path: PathLike) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

/**
 * Flush stdout and stderr, before exit is called.
 *
 * - Exits after 300ms if streams doesn't end within.
 */
export const flushAndExit = () => {
  let out = false;
  let err = false;

  const tryExit = () => {
    if (out && err) {
      process.exit();
    }
  };

  if (process.stdout.writableLength <= 0) {
    out = true;
  } else {
    process.stdout.end(() => {
      out = true;
      tryExit();
    });
  }

  if (process.stderr.writableLength <= 0) {
    err = true;
  } else {
    process.stderr.end(() => {
      err = true;
      tryExit();
    });
  }

  //if nothing to flush

  tryExit();

  //if stream take to long to flush.

  setTimeout(process.exit, 300);
};
