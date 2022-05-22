import { getPromise } from "^jab";

import { BeeResult, ExecBee, ExecBeeDeps, JagoLogEntry } from "^jabc";

//
// Similar to `exec.ts` but for bee interface.

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
export const execBee: ExecBee = <MR extends {}, MS extends {}>({
  def,
  finallyFunc,
  makeBee,
}: ExecBeeDeps) => {
  const prom = getPromise<BeeResult<MR>>();

  // state

  let stdout = "";
  let stderr = "";
  const messages: MR[] = [];
  const logs: JagoLogEntry[] = [];
  const errors: unknown[] = [];

  // handlers

  const onExit = (status: number | null) => {
    prom.resolve({
      stdout,
      stderr,
      status,
      messages,
      logs,
      errors,
    });
  };

  //  process/worker

  const bee = makeBee<MS, MR>({
    def,
    onMessage: (msg) => {
      messages.push(msg);
    },
    onLog: (entry) => {
      logs.push(entry);
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
