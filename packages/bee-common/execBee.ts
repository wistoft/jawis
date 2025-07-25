import { getPromise } from "^yapu";
import { unknownToErrorData, LogEntry, err } from "^jab";

import { BeeResult, ExecBee, ExecBeeDeps } from "./internal";

/**
 *
 */
export const execBeeAndGetStdout = async <MR extends {}, MS extends {}>(
  deps: ExecBeeDeps
) => {
  const stdoutArray: string[] = [];

  const beeResult = await execBee({
    ...deps,
    onStdout: (data: Buffer | string) => {
      stdoutArray.push(data.toString());
    },
  }).promise;

  const stdout = stdoutArray.join("").split("\n");

  // check the stdout, stderr and exit code

  if (beeResult.logs.length === 0 && beeResult.messages.length === 0) {
    return stdout;
  }

  // it's an error

  throw err("Execution failed", {
    stdout,
    ...beeResult,
  });
};

/**
 *
 *
 * - Resolve, when the process ends.
 * - Return stdout, err and messages.
 * - Return errors occuring during execution, when onexit is called.
 * - Does not reject on errors, because there might be several.
 *    So waits for exit to resolve.
 *
 * note
 *  assumes that `onExit` is always called.
 */
export const execBee: ExecBee = <MR extends {}, MS extends {}>(
  deps: ExecBeeDeps
) => {
  const prom = getPromise<BeeResult<MR>>();

  // state

  const messages: MR[] = [];
  const logs: LogEntry[] = [];

  // handlers

  const onExit = (status?: number | null) => {
    deps.onExit?.(status);

    prom.resolve({
      messages,
      logs,
    });
  };

  //  process/worker

  const bee = deps.makeBee<MS, MR>({
    onMessage: (msg) => {
      messages.push(msg);
    },
    onLog: (entry) => {
      logs.push(entry);
    },

    onStdout: (data: Buffer | string) => {
      logs.push({
        type: "stream",
        logName: "stdout",
        data: data.toString(),
      });
    },
    onStderr: (data: Buffer | string) => {
      logs.push({
        type: "stream",
        logName: "stderr",
        data: data.toString(),
      });
    },
    onError: (error) => {
      logs.push({
        type: "error",
        data: unknownToErrorData(error),
      });
    },
    finally: deps.finallyFunc,
    ...deps,
    onExit,
  });

  // return

  return { bee, promise: prom.promise };
};
