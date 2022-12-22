import fs from "fs";
import path from "path";
import { Worker, WorkerOptions } from "worker_threads";

import { err } from "^jab";

import type { MakeBee, LoadFunction } from "..";
import {
  RequireSenderMessage,
  JabWorker,
  Process,
  MakeJabProcess,
  MakeNodeWorker,
} from ".";

//We start TypeScript, so we need a large timeout :-)
export const TS_TIMEOUT = 4000;

/**
 *  identity implementation.
 */
export const makePlainJabProcess: MakeJabProcess = (deps) => new Process(deps);

/**
 *  identity implementation.
 */
export const makePlainWorkerBee: MakeBee = (deps) =>
  new JabWorker({ ...deps, makeWorker: makePlainWorker });

/**
 *  identity implementation.
 */
export const makePlainWorker: MakeNodeWorker = (
  filename: string,
  options?: WorkerOptions
) => new Worker(filename, options);

/**
 *
 */
export const makeMakeTsJabProcessConditonally =
  (makeTsJabProcess: MakeJabProcess): MakeJabProcess =>
  (deps) => {
    if (deps.filename.endsWith(".ts") || deps.filename.endsWith(".tsx")) {
      return makeTsJabProcess(deps);
    } else {
      return makePlainJabProcess(deps);
    }
  };

/**
 * Get files required, even though they've already been loaded.
 *
 * note
 *  - load only returns module.exports, so it is hard to get hand on the filename.
 *  - calling _resolveFilename() here is a lot of extra work.
 *    Except if it just hits a cache: https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js#L465
 */
export const makeRequireSender = (
  parentSend: (msg: RequireSenderMessage) => void
): LoadFunction =>
  //must be function declaration
  function requireSender(this, request, parent, isMain) {
    const filename = this._resolveFilename(request, parent, isMain);

    parentSend({ type: "require", file: filename, source: parent?.filename });

    const res = (this as any)._originalLoad(request, parent, isMain);

    return res;
  };

/**
 * Switch automatically between development and production version of a script.
 *
 */
export const getFileToRequire = (dir: string, file: string) => {
  const prod = path.join(dir, "compiled", file + ".js");
  const dev = path.join(dir, file + ".ts");

  const hasProd = fs.existsSync(prod);
  const hasDev = fs.existsSync(dev);

  if (hasProd && hasDev) {
    err("Prod and dev must not be present at the same time.");
  }

  if (hasProd) {
    return prod;
  }

  if (hasDev) {
    return dev;
  }

  throw err("Couldn't find prod or dev file.", { prod, dev });
};
