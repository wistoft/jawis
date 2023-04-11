import { exec, httpRequest } from "^jab-node";

import { err } from "^jab/error";

/**
 *
 */
export const getNpmInfo = (packageName: string, throwOnNotFound = true) =>
  httpRequest({
    protocol: "https:",
    hostname: "registry.npmjs.org",
    path: "/" + packageName,
  })
    .then((resp) => JSON.parse(resp.data))
    .then((data) => {
      if (data.error === "Not found")
        if (throwOnNotFound) {
          err("Could find package: " + packageName);
        } else {
          return;
        }

      return data;
    });

/**
 *
 */
export const getNpmLatestInfo = async (
  packageName: string,
  throwOnNotFound = true
): Promise<{ version: string; dist: { tarball: string } } | undefined> => {
  const data = await getNpmInfo(packageName, throwOnNotFound);

  if (data === undefined) {
    return;
  }

  const version = data["dist-tags"].latest;
  return data.versions[version];
};

/**
 *
 */
export const execNpmAndGetStdout = async (command: string, cwd: string) => {
  const res = await exec(command, [], {
    cwd,
    shell: true,
    //to revert yarn's 'crazy' injection of environment variables.
    env: {},
  });

  const stdout = filterNpmOutput(res.stdout);
  const stderr = filterNpmOutput(res.stderr);

  if (stderr === "" && res.status === 0) {
    return stdout;
  }

  // it's an error

  throw err("Npm failed", {
    command,
    cwd,
    retval: res.status,
    stdout: stdout,
    stderr: stderr,
  });
};

/**
 *
 */
export const filterNpmOutput = (stdio: string) => {
  let last = "";
  let tmp = stdio;

  while (tmp !== last) {
    last = tmp;
    tmp = tmp.replace(/(?=\n|)\s*npm notice.*(?=\n|)/, "");
  }

  return tmp.trim();
};
