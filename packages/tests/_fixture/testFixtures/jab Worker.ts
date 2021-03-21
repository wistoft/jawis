import {
  JabWorker,
  JabWorkerDeps,
  makePlainWorker,
  StructuredCloneable,
} from "^jab-node";

import { getScriptPath, TestMainProv } from ".";

export const getJabWorker = (
  prov: TestMainProv,
  extraDeps?: Partial<JabWorkerDeps<StructuredCloneable, StructuredCloneable>>
) => new JabWorker(getJabWorkerDeps(prov, "worker.", extraDeps));

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

  makeWorker: makePlainWorker,

  ...extraDeps,
});
