import path from "path";

import { ProcessDeps, Process } from "^jab-node";
import { makeTsNodeJabProcess } from "^util-javi/node";

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

  return proc.waiter.await("message").then(() => proc);
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

  return proc.waiter.await("message").then(() => proc);
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
    onMessage: (msg) => {
      prov.log("childMessage", msg);
    },
    onStdout: (data) => {
      prov.logStream(logPrefix + "stdout", data.toString());
    },
    onStderr: (data) => {
      prov.logStream(logPrefix + "stderr", data.toString());
    },
    onError: (error) => {
      prov.onError(error);
    },
    onExit: () => {},
    onClose: () => {},
    finally: prov.finally,
    ...extraDeps,
  };
};
