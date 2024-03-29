import path from "path";

import { ProcessDeps, Process } from "^jab-node";
import { makeTsNodeJabProcess } from "^javi/util";

import { getScriptPath, TestMainProv } from ".";

/**
 *
 */
export const getJabProcess = (
  prov: TestMainProv,
  extraDeps?: Partial<ProcessDeps<any>>,
  logPrefix?: string
) => new Process(getJabProcessDeps(prov, extraDeps, logPrefix));

/**
 *
 */
export const getJabProcess_ready = (
  prov: TestMainProv,
  extraDeps?: Partial<ProcessDeps<any>>,
  logPrefix?: string
) => {
  const proc = getJabProcess(
    prov,
    {
      filename: getScriptPath("ipcSendAndWait.js"),
      ...extraDeps,
    },
    logPrefix
  );

  return proc.waiter.await("message", 10000).then(() => proc);
};

/**
 *
 */
export const getJabTsProcess = (
  prov: TestMainProv,
  extraDeps?: Partial<ProcessDeps<any>>,
  logPrefix?: string
) => makeTsNodeJabProcess(getJabProcessDeps(prov, extraDeps, logPrefix));

/**
 *
 */
export const getJabTsProcess_ready = (
  prov: TestMainProv,
  extraDeps?: Partial<ProcessDeps<any>>,
  logPrefix?: string
) => {
  const proc = getJabTsProcess(
    prov,
    {
      filename: getScriptPath("ipcSendAndWait.js"),
      ...extraDeps,
    },
    logPrefix
  );

  return proc.waiter.await("message", 10000).then(() => proc);
};

/**
 *
 */
export const getStdinBlockProcess = (prov: TestMainProv) =>
  getJabProcess(prov, {
    filename: getScriptPath("helloBlock.js"),
  });

/**
 *
 */
export const getProcessDepsThatMustNotBeUsed = (): ProcessDeps<any> => {
  const complain = () => {
    throw new Error("Must not be called");
  };

  return {
    filename: getScriptPath("thisFileMustNotBeUsed.js"),
    onMessage: complain,
    onStdout: complain,
    onStderr: complain,
    onError: complain,
    onExit: complain,
    onClose: complain,
    finally: complain,
  };
};

/**
 *
 */
export const getJabProcessDeps = (
  prov: TestMainProv,
  extraDeps?: Partial<ProcessDeps<any>>,
  logPrefix = "child."
): ProcessDeps<any> => {
  if (extraDeps && extraDeps.filename && !path.isAbsolute(extraDeps.filename)) {
    throw new Error("Script must be absolute: " + extraDeps.filename);
  }

  return {
    filename: getScriptPath("hello.js"),
    onMessage: (msg: unknown) => {
      prov.log("childMessage", msg);
    },
    onStdout: (data: Buffer) => {
      prov.logStream(logPrefix + "stdout", data.toString());
    },
    onStderr: (data: Buffer) => {
      prov.logStream(logPrefix + "stderr", data.toString());
    },
    onError: (error: unknown) => {
      prov.onError(error);
    },
    onExit: () => {},
    onClose: () => {},
    finally: prov.finally,
    ...extraDeps,
  };
};
