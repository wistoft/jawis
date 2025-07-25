import { NodeProcessDeps, NodeProcess } from "^process-util";

import { getScriptPath, TestMainProv } from ".";

/**
 *
 */
export const getNodeProcess = (
  prov: TestMainProv,
  extraDeps?: Partial<NodeProcessDeps<any>>,
  logPrefix?: string
) => new NodeProcess(getJabProcessDeps(prov, extraDeps, logPrefix));

/**
 *
 */
export const getNodeProcess_ready = (
  prov: TestMainProv,
  extraDeps?: Partial<NodeProcessDeps<any>>,
  logPrefix?: string
) => {
  const proc = getNodeProcess(
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
  getNodeProcess(prov, {
    filename: getScriptPath("helloBlock.js"),
  });

/**
 *
 */
export const getJabProcessDeps = (
  prov: TestMainProv,
  extraDeps?: Partial<NodeProcessDeps<any>>,
  logPrefix = "child."
): NodeProcessDeps<any> => {
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
