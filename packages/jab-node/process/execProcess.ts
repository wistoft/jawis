import path from "path";
import { StdioOptions, Serializable } from "child_process";

import { getPromise, FinallyFunc, err } from "^jab";

import { BeeResult, Process, ProcessDeps } from ".";
import { ExecBee } from "./types";
import { MakeBee } from "^jab-node/types";

//
// Similar to `exec.ts`
//
// - Only for node processes.
// - TypeScript only possible with ts-node: @see `jsExecTsNodeConditonally`

/**
 *
 *
 * - Resolve, when the process ends.
 * - Return stdout, err and messages.
 *
 */
export const execBee: ExecBee = <
  MR extends Serializable,
  MS extends Serializable
>(
  script: string,
  finallyFunc: FinallyFunc,
  makeJabProcess: MakeBee
) => {
  const prom = getPromise<BeeResult<MR>>();

  // state

  let stdout = "";
  let stderr = "";
  const messages: MR[] = [];

  // handlers

  const onExit = (status: number | null) => {
    prom.resolve({
      stdout,
      stderr,
      status,
      messages,
    });
  };

  //  process/worker

  const bee = makeJabProcess<MS, MR>({
    filename: script,
    onMessage: (msg) => {
      messages.push(msg);
    },
    onStdout: (data: Buffer) => {
      stdout += data.toString();
    },
    onStderr: (data: Buffer) => {
      stderr += data.toString();
    },
    onError: prom.reject as (error: unknown) => void,
    onExit,
    finally: finallyFunc,
  });

  // return

  return { bee, promise: prom.promise };
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
export const nodeExecNoisy = (
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
