import { JabWorker, JabWorkerDeps } from "^process-util";
import { StructuredCloneable } from "^jab-node";

import { getScriptPath, TestMainProv } from ".";

export const getJabWorker = (
  prov: TestMainProv,
  extraDeps?: Partial<JabWorkerDeps<StructuredCloneable, StructuredCloneable>>
) => new JabWorker(getJabWorkerDeps(prov, "worker.", extraDeps));

/**
 *
 */
export const getJabWorker_sub_spawn = (
  prov: TestMainProv,
  extraDeps: Partial<JabWorkerDeps<StructuredCloneable, StructuredCloneable>>
) =>
  getJabWorker(prov, {
    ...extraDeps,
    filename: getScriptPath("node-spawn.js"),
    workerOptions: {
      ...extraDeps?.workerOptions,
      env: { SPAWN_SCRIPT: extraDeps.filename },
    },
  });

/**
 *
 */
export const getJabWorker_sub_spawn_detached = (
  prov: TestMainProv,
  extraDeps: Partial<JabWorkerDeps<StructuredCloneable, StructuredCloneable>>
) =>
  getJabWorker(prov, {
    ...extraDeps,
    filename: getScriptPath("node-spawn-detached.js"),
    workerOptions: {
      ...extraDeps?.workerOptions,
      env: { SPAWN_SCRIPT: extraDeps.filename },
    },
  });

/**
 *
 */
export const getJabWorkerDeps = (
  prov: TestMainProv,
  logPrefix = "",
  extraDeps?: Partial<JabWorkerDeps<StructuredCloneable, StructuredCloneable>>
): JabWorkerDeps<StructuredCloneable, StructuredCloneable> => ({
  filename: getScriptPath("hello.js"),

  onMessage: (msg: StructuredCloneable) => {
    prov.log("workerMessage", msg);
  },

  onStdout: (data: Buffer) => {
    prov.logStream(logPrefix + "stdout", data.toString());
  },

  onStderr: (data: Buffer) => {
    prov.logStream(logPrefix + "stderr", data.toString());
  },

  onExit: () => {},

  finally: prov.finally,
  onError: prov.onError,

  ...extraDeps,
});
