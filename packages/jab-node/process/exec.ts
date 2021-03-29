import cp, { SpawnSyncReturns } from "child_process";

import { err, indent } from "^jab";

import { SpawnResult } from ".";

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
export const execSync = (command: string, args?: string[]) =>
  mapSpawnSyncResult(cp.spawnSync(command, args));

/**
 *
 */
export const execSyncAndGetStdout = (cmd: string, args?: string[]) => {
  const result = execSync(cmd, args);

  // check the stdout, stderr and exit code

  if (result.stderr === "" && result.status === 0) {
    return result.stdout;
  }

  // it's an error

  throw new Error(
    "execAndGetStdoutNew() - error: \n" +
      formatExecInformation({
        cmd,
        args,
        retval: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
      })
  );
};

/**
 *
 */
export const execSilentSync = (command: string, args?: string[]) => {
  const result = execSync(command, args);

  return mapSilent(command, args, result);
};

/**
 * async
 */
export const execSilent = (command: string, args?: string[]) =>
  exec(command, args).then((result) => mapSilent(command, args, result));

/**
 * 1. Make errors noisy.
 * 2. Make returned data simpler and easier typed.
 * 3. Return a promise.
 *
 * Make this into a wrapper around childProcess object.
 */
export const exec = (command: string, args?: string[]) =>
  new Promise<SpawnResult>((resolve, reject) => {
    const proc = cp.spawn(command, args);

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
export const mapSpawnSyncResult = (result: SpawnSyncReturns<string>) => {
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
const mapSilent = (
  cmd: string,
  args: string[] | undefined,
  result: SpawnResult
) => {
  // check the stdout, stderr and exit code

  if (result.stdout === "" && result.stderr === "" && result.status === 0) {
    return;
  }

  // it's an error

  throw new Error(
    "execAndThrowOnStdout() - error: \n" +
      formatExecInformation({
        cmd,
        args,
        retval: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
      })
  );
};

/**
 *
 */
const formatExecInformation = ({
  cmd,
  args = [],
  retval,
  stdout,
  stderr,
}: {
  cmd: string;
  args?: string[];
  retval: number | null;
  stdout: string;
  stderr: string;
}) => {
  let errMsg = "";

  errMsg = "";
  errMsg += "\nCOMMAND\n" + indent(cmd, 2, " ");
  errMsg += "\nARGS\n" + indent(args.toString(), 2, " ");
  errMsg += "\nRET: " + retval;
  errMsg += "\nOUT\n" + indent(stdout, 2, " ") + "\nEND";
  errMsg += "\nERR\n" + indent(stderr, 2, " ") + "\nEND";

  return indent(errMsg, 1, " ");
};
