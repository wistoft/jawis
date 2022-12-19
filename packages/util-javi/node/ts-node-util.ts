import path from "path";
import { Worker } from "worker_threads";
import { FinallyFunc } from "^finally-provider";

import { assert } from "^jab";
import {
  makePlainJabProcess,
  MakeJabProcess,
  MakeNodeWorker,
  Process,
  execBee,
  JabWorker,
  JabWorkerDeps,
  MakeBee,
} from "^jab-node";

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
 *  process.execArgv arves, så hvis ts-node er registreret, så bliver det automatisk for worker.
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
export const makeTsNodeWorkerBee: MakeBee = <MR, WD>(
  deps: Omit<JabWorkerDeps<MR, WD>, "makeWorker">
) => new JabWorker({ ...deps, makeWorker: makeTsNodeWorker });

/**
 *
 */
export const makeTsNodeJabProcessConditonally: MakeJabProcess = (deps) => {
  if (deps.filename.endsWith(".ts") || deps.filename.endsWith(".tsx")) {
    return makeTsNodeJabProcess(deps);
  } else {
    return makePlainJabProcess(deps);
  }
};

/**
 *
 */
export const nodeExecTsNodeConditonally = (
  script: string,
  finallyFunc: FinallyFunc = () => {}
) => execBee(script, finallyFunc, makeTsNodeJabProcessConditonally);
