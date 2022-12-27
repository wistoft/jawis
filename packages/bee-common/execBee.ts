import { getPromise } from "^yapu";
import { FinallyFunc } from "^finally-provider";

import { ExecBee, MakeBee, BeeResult } from "./internal";

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
export const execBee: ExecBee = <MR extends {}, MS extends {}>(
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
