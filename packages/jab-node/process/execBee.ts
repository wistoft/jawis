import path from "path";
import { StdioOptions, Serializable } from "child_process";

import { getPromise, FinallyFunc } from "^jab";

import { BeeResult, ProcessDeps } from ".";
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
 * - Return errors occuring during execution, when onexit is called.
 *
 * note
 *  assumes that `onExit` is always called.
 */
export const execBee: ExecBee = <
  MR extends Serializable,
  MS extends Serializable
>(
  script: string,
  finallyFunc: FinallyFunc,
  makeBee: MakeBee
) => {
  const prom = getPromise<BeeResult<MR>>();

  // state

  let stdout = "";
  let stderr = "";
  const messages: MR[] = [];
  const errors: unknown[] = [];

  // handlers

  const onExit = (status: number | null) => {
    prom.resolve({
      stdout,
      stderr,
      status,
      messages,
      errors,
    });
  };

  //  process/worker

  const bee = makeBee<MS, MR>({
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
    onError: (error) => {
      errors.push(error);
    },
    onExit,
    finally: finallyFunc,
  });

  // return

  return { bee, promise: prom.promise };
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
