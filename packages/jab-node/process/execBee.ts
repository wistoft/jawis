import path from "path";
import { StdioOptions, Serializable } from "child_process";

import { ProcessDeps } from ".";

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
