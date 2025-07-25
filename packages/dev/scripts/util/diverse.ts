import path from "node:path";
import { MainProv, StructuredCloneable } from "^jab-node";
import { packageFolder } from "^dev/project.conf";
import { makeTsNodeJabProcess } from "^javi/internal";
import {
  exec,
  execShell,
  JabWorker,
  JabWorkerDeps,
  NodeProcess,
  NodeProcessDeps,
} from "^process-util";

/**
 *
 */
export const getScriptPath = (script?: string) =>
  path.join(packageFolder, "tests/_fixtures/scripts", script || "");

/**
 *
 */
export const getJabWorker = (
  prov: MainProv,
  extraDeps?: Partial<JabWorkerDeps<StructuredCloneable, StructuredCloneable>>
) =>
  new JabWorker({
    ...getJabProcessDeps(prov, extraDeps, "worker."),
    onExit: () => {},
  });

/**
 *
 */
export const getJabTsProcess = (
  prov: MainProv,
  extraDeps?: Partial<NodeProcessDeps<any>>,
  logPrefix?: string
) => makeTsNodeJabProcess(getJabProcessDeps(prov, extraDeps, logPrefix));

/**
 *
 */
export const getJabProcess = (
  prov: MainProv,
  extraDeps?: Partial<NodeProcessDeps<any>>,
  logPrefix?: string
) => new NodeProcess(getJabProcessDeps(prov, extraDeps, logPrefix));

/**
 *
 */
export const getJabProcessDeps = (
  prov: MainProv,
  extraDeps?: Partial<NodeProcessDeps<any>>,
  logPrefix = "child."
): NodeProcessDeps<any> => {
  if (extraDeps && extraDeps.filename && !path.isAbsolute(extraDeps.filename)) {
    throw new Error("Script must be absolute: " + extraDeps.filename);
  }

  return {
    filename: "dummy.js",
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
