import fs, { PathLike } from "fs";
import path from "path";

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
 *
 * note
 *  - sync flush isn't possible because stdio is implicitly buffered in the event queue.
 *  - This is probably better: https://github.com/cowboy/node-exit/blob/master/lib/exit.js
 */
export const asyncFlushAndExit = () => {
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

/**
 * - Will include folder given as input.
 */
export const getParentFolders = (folder: string) => {
  const res: string[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    res.push(folder);

    if (folder == path.dirname(folder)) {
      break;
    }
    folder = path.dirname(folder);
  }

  return res;
};

/**
 * Make the file absolute, if isn't already.
 */
export const makeAbsolute = (confFileDir: string, file: string) => {
  if (path.isAbsolute(file)) {
    return file;
  } else {
    return path.join(confFileDir, file);
  }
};
