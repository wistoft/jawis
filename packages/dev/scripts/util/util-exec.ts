import path from "path";
import fs from "fs";
import { exec, ExecOptions, execSync } from "child_process";

export const ownExec = (cmd: string, options?: ExecOptions) => {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>(
    (resolve, reject) => {
      const cp = exec(cmd, options);

      let stdout = "";
      let stderr = "";

      cp.stdout!.on("data", (data) => {
        stdout += data;
      });

      cp.stderr!.on("data", (data) => {
        stderr += data;
      });

      // exit is not enough. Have to wait for close to get all stdout.
      cp.on("close", (code) => resolve({ code, stdout, stderr }));
    }
  );
};
