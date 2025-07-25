import os from "node:os";
import fs, { PathLike } from "node:fs";
import path from "node:path";

import {
  AbsoluteFile,
  assert,
  CanonicalFile,
  DefaultCompiledFolder,
  GetAbsoluteSourceFile,
} from "^jab";
import { poll } from "^yapu";

// to handle webpack compiling for node.js.
export const nodeRequire: NodeRequire = eval("require");

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
export const asyncFlushAndExit = (exitCode = 0) => {
  let out = false;
  let err = false;

  const tryExit = () => {
    if (out && err) {
      process.exit(exitCode);
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

  setTimeout(() => process.exit(exitCode), 300);
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
 * Returns nearest project.json, if it exists.
 */
export const locateProjectJson = (startingFolder: string) => {
  for (const folder of getParentFolders(startingFolder)) {
    const file = path.join(folder, "package.json");
    if (fs.existsSync(file)) {
      return file;
    }
  }
};

/**
 * Make the file absolute, if isn't already.
 */
export const makeAbsolute = (folder: string, file: string) => {
  if (path.isAbsolute(file)) {
    return file as AbsoluteFile;
  } else {
    return path.join(folder, file) as AbsoluteFile;
  }
};

/**
 *
 */
export const makeCanonical = (_file: AbsoluteFile) => {
  let file = _file.replace(/\\/g, "/");

  if (os.platform() === "win32") {
    file = file.toLowerCase();
  }

  return file as any as CanonicalFile;
};

/**
 *
 */
export const assertAbsolute = (file: string) => {
  assert(path.isAbsolute(file), "File must be absolute: " + file);

  return file as AbsoluteFile;
};

/**
 *
 */
export const sendKillSignal = (pid: number, testAlivenass?: boolean) => {
  try {
    return process.kill(pid, testAlivenass ? 0 : "SIGKILL");
  } catch (error: any) {
    if (error.code === "ESRCH") {
      return false;
    } else {
      throw error;
    }
  }
};

/**
 *
 */
export const isProcessAlive = (pid: number) => sendKillSignal(pid, true);

/**
 * More sensible, than process.kill
 *
 * inpired by: https://github.com/dwyl/terminate/
 */
export const killProcess = (pid: number) => {
  sendKillSignal(pid);

  if (isProcessAlive(pid)) {
    console.log("killProcess - it actually took time to die.");
  }

  return poll(() => !isProcessAlive(pid), 20);
};

/**
 *
 */
export const getAbsoluteSourceFile_live: GetAbsoluteSourceFile = (
  deps
): AbsoluteFile =>
  assertAbsolute(
    path.join(deps.folder, DefaultCompiledFolder, deps.file + ".js")
  );
