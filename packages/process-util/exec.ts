import cp, {
  SpawnSyncReturns,
  SpawnOptionsWithoutStdio,
  SpawnSyncOptions,
} from "node:child_process";

import { err } from "^jab";

import { SpawnResult } from "./internal";

// Convenience functions for doing simple things. typically when
//  interaction with the process is unneeded.
//
//  TypeScript supported by settings args, and be in same workdir as tsconfig.json
//        [
//          "-r",
//          "ts-node/register/transpile-only",
//          "-r",
//          "tsconfig-paths/register",
//          <filename>
//        ]

/**
 *
 */
export const execSync = (
  command: string,
  args?: string[],
  options?: SpawnSyncOptions
) => mapSpawnSyncResult(cp.spawnSync(command, args, options));

/**
 *
 */
export const execAndGetStdoutSync = (
  command: string,
  args?: string[],
  options?: SpawnSyncOptions
) => mapToStdout(command, args, execSync(command, args, options));

/**
 *
 */
export const execAndGetStdout = (
  command: string,
  args?: string[],
  options?: SpawnOptionsWithoutStdio
) =>
  exec(command, args, options).then((result) =>
    mapToStdout(command, args, result)
  );

/**
 *
 */
export const execSilentSync = (
  command: string,
  args?: string[],
  options?: SpawnSyncOptions
) => mapSilent(command, args, execSync(command, args, options));

/**
 *
 */
export const execSilent = (
  command: string,
  args?: string[],
  options?: SpawnOptionsWithoutStdio
) =>
  exec(command, args, options).then((result) =>
    mapSilent(command, args, result)
  );

/**
 *
 */
export const execShell = (
  command: string,
  options?: SpawnOptionsWithoutStdio
) =>
  exec(command, [], {
    ...options,
    shell: true,
  }).then((res) => {
    res.stderr !== "" && console.log(res.stderr);
    res.stdout !== "" && console.log(res.stdout);
  });

/**
 * 1. Make errors noisy.
 * 2. Make returned data simpler and easier typed.
 * 3. Return a promise.
 *
 * todo
 *  implement with RealProcess. It fixes the onError/onExit problem.
 */
export const exec = (
  command: string,
  args?: string[],
  options?: SpawnOptionsWithoutStdio
) =>
  new Promise<SpawnResult>((resolve, reject) => {
    const proc = cp.spawn(command, args, options);

    // state

    const ioData = { out: "", err: "" };
    let exitHandled = false;

    //
    // handlers
    //

    const onData = (type: "out" | "err") => (data: unknown) => {
      if (data instanceof Buffer) {
        //quick fix: any needed for gulp compile, because instanceof doesn't narrow the type, when Buffer type any
        ioData[type] += (data as any).toString();
      } else {
        err("unknown type: ", data);
      }
    };

    const onExit = (status: number | null) => {
      if (!exitHandled) {
        exitHandled = true;
        resolve({
          stdout: ioData.out,
          stderr: ioData.err,
          status,
        });
      }
    };

    //
    // add handlers
    //

    proc.stdout.on("data", onData("out"));

    proc.stderr.on("data", onData("err"));

    proc.on("error", reject);

    proc.on("exit", onExit);

    proc.on("close", onExit);
  });

//
// util
//

/**
 *
 */
export const mapSpawnSyncResult = (
  result: SpawnSyncReturns<string | Buffer>
): SpawnResult => {
  if (result.error) {
    // would be nice to incorporate the other information here.
    throw result.error;
  }

  return {
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
    status: result.status,
  };
};

/**
 *
 */
export const mapToStdout = (
  command: string,
  args: string[] | undefined,
  result: SpawnResult
): string => {
  // check the stdout, stderr and exit code

  if (result.stderr === "" && result.status === 0) {
    return result.stdout;
  }

  // it's an error

  throw err("Execution failed", {
    command,
    args,
    retval: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  });
};

/**
 *
 */
const mapSilent = (
  command: string,
  args: string[] | undefined,
  result: SpawnResult
) => {
  // check the stdout, stderr and exit code

  if (result.stdout === "" && result.stderr === "" && result.status === 0) {
    return;
  }

  // it's an error

  err("Execution failed", {
    command,
    args,
    retval: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  });
};
