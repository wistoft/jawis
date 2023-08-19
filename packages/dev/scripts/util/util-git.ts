import { assert, basename, err } from "@jawis/jab";

import { ownExec } from "./util-exec";

// related
//  https://www.npmjs.com/package/git-state
//

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
