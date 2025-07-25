import path from "node:path";
import { Worker } from "node:worker_threads";

import { assert } from "^jab";
import { MakeNodeWorker } from "^process-util";

/**
 * Load a .ts file, even though that extension isn't allowed.
 *
 * - Start ts-node TypeScript compiler.
 * - execArgv not supported.
 *
 * note
 *  process.execArgv is inherited, therefore if ts_node is registered, it will also be registered for worker.
 *  Double ts-node registrering giver en fejl med noget: --isolated-modules.
 *
 * @source: https://github.com/TypeStrong/ts-node/issues/711
 *          https://github.com/TypeStrong/ts-node/issues/676
 */
export const makeTsNodeWorker: MakeNodeWorker = (filename, options = {}) => {
  assert(path.isAbsolute(filename));
  assert(!(options && "eval" in options), "eval not supported");

  if (options.workerData) {
    assert(
      !("runThisFileInTheWorker" in options.workerData),
      "runThisFileInTheWorker not allowed in workerData."
    );
  }

  const script =
    "require(require('worker_threads').workerData.runThisFileInTheWorker);";

  return new Worker(script, {
    ...options,
    eval: true,
    workerData: { ...options.workerData, runThisFileInTheWorker: filename },
    execArgv: [
      "-r",
      "ts-node/register/transpile-only",
      "-r",
      "tsconfig-paths/register",
      ...(options.execArgv || []),
    ],
  });
};
