import path from "path";
import { StdioOptions, Serializable } from "child_process";

import { assert, getPromise, FinallyFunc, err } from "^jab";

import {
  MakeJabProcess,
  makePlainJabProcess,
  Process,
  ProcessDeps,
  SpawnResult,
} from ".";

//
// Similar to `exec.ts`
//
// - Only for node processes.
// - TypeScript only possible with ts-node: @see `jsExecTsNodeConditonally`

/**
 * Similar to exec(), but allows ts compile.
 *
 * onMessage not implemented.
 *
 */
export const jsExec = (
  script: string,
  args: string[] | undefined = undefined,
  makeJabProcess: MakeJabProcess = makePlainJabProcess,
  finallyFunc: FinallyFunc = () => {}
) => {
  assert(args === undefined, "not impl");

  const prom = getPromise<SpawnResult>();

  // state

  let stdout = "";
  let stderr = "";

  let exitHandled = false;

  //
  // handlers
  //

  const onStdout = (data: Buffer) => {
    stdout += data.toString();
  };

  const onStderr = (data: Buffer) => {
    stderr += data.toString();
  };

  const onExit = (status: number | null) => {
    exitHandled = true;

    prom.resolve({
      stdout,
      stderr,
      status,
    });
  };

  const onClose = () => {
    if (!exitHandled) {
      console.log("Process.onClose: Expected exit already happend.");
    }
  };

  //
  //  process
  //

  makeJabProcess({
    filename: script,
    execArgv: args,
    onMessage: (msg) => {
      console.log("Process.onMessage: Unexpected message.", msg);
    },
    onStdout,
    onStderr,
    onError: prom.reject as (error: unknown) => void,
    onExit,
    onClose,
    finally: finallyFunc,
  });

  //
  // return
  //

  return prom.promise;
};

/**
 * ubrugt
 *
 * doesn't work: because Process doesn't implement args, it's actually execArgs.
 *
 * 1. Only for node scripts.
 * 2. IPC by default.
 * 3. Everything noisy. Add listeners to suppress.
 */
export const jsExecNoisy = (
  filename: string,
  args: string[] = [],
  cwd: string | undefined = undefined
) => {
  if (args.length !== 0) {
    err("not impl");
  }

  return new Process(
    createNoisyProcessDeps({
      filename,
      execArgv: args,
      cwd,
    })
  );
};

/**
 *
 */
export const createNoisyProcessDeps = (
  extraDeps: { filename: string } & Partial<ProcessDeps<Serializable>>
): ProcessDeps<Serializable> => {
  const stdio: StdioOptions = ["ignore", "pipe", "pipe", "ipc"];
  return {
    execArgv: [],
    stdio,
    onMessage: (message: unknown) => {
      console.log("Process.onMessage: ", message);
    },
    onStdout: (data: Buffer) => {
      console.log("Process.onStdout: ", data.toString());
    },
    onStderr: (data: Buffer) => {
      console.log("Process.onStderr: ", data.toString());
    },
    onError: (error: unknown) => {
      console.log("Process.onError: ", error);
    },
    onExit: (status: number | null) => {
      console.log(
        "Process.onExit, " + status + ", " + path.basename(extraDeps.filename)
      );
    },
    onClose: () => {
      console.log("Process.onClose");
    },
    finally: () => {
      console.log("finally registration not impl.");
    },
    ...extraDeps,
  };
};
