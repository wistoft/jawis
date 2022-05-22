import path from "path";
import { Worker } from "worker_threads";

import { assert, BeeDeps, MakeBee } from "^jab";
import { MakeJabProcess, MakeNodeWorker, Process, JabWorker } from "^jab-node";

/**
 *
 */
export const makeTsNodeJabProcess: MakeJabProcess = (deps) => {
  if (deps.execArgv && deps.execArgv.length > 0) {
    throw new Error("not impl");
  }

  const tsNodeArgs = [
    "-r",
    "ts-node/register/transpile-only",
    "-r",
    "tsconfig-paths/register",
  ];

  const nodeArgs = [...tsNodeArgs];

  return new Process({
    ...deps,
    execArgv: nodeArgs,
    cwd: path.dirname(deps.filename),
  });
};

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
  assert(!(options && "execArgv" in options), "execArgv not supported");
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
    ],
  });
};

/**
 *
 */
export const makeTsNodeWorkerBee: MakeBee = <MR>(deps: BeeDeps<MR>) => {
  if (deps.def.next) {
    throw new Error("next not impl");
  }

  return new JabWorker({
    ...deps,
    filename: deps.def.filename,
    workerData: deps.def.data as any,
    makeWorker: makeTsNodeWorker,
  });
};
