import { exec, ExecOptions, execSync } from "node:child_process";

import { err } from "^jab";
import { makeAbsolute } from "^jab-node";

/**
 * related
 *  - https://www.npmjs.com/package/git-state
 *  - https://www.npmjs.com/package/git-branch
 */

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

/**
 *
 */
export const getFilesInGit = (folder: string) =>
  execSync("git ls-tree -r --name-only HEAD", {
    cwd: folder,
  })
    .toString()
    .trim()
    .split("\n");

/**
 *
 */
export const getAbsoluteFilesInGit = (folder: string) =>
  getFilesInGit(folder).map((file) => makeAbsolute(folder, file));

/**
 * - return undefined if no status problems
 */
export const getGitStatus = (cwd: string) =>
  ownExec("git status", { cwd }).then(({ code, stdout, stderr }) => {
    if (
      code !== 0 ||
      !stdout.endsWith("nothing to commit, working tree clean\n") ||
      stderr !== ""
    ) {
      return { code, stdout, stderr };
    }
  });

/**
 *
 */
export const assertGitClean = (cwd: string) =>
  getGitStatus(cwd).then((res) => {
    if (res !== undefined) {
      err("Git is not clean: " + cwd, { stdio: res.stdout + " " + res.stderr });
    }
  });
