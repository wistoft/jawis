import { BeeDeps } from "^bee-common";
import { MainProv } from "^jab-node";
import { makeMainProvToConsole } from "^main-wrapper";
import { NodeProcessDeps } from "^process-util";

import { getMakeMakeJacsWorkerBee } from "^dev/project.conf";
import { AbsoluteFile } from "^jab";

const mainProv = makeMainProvToConsole();

const makeJacsBee = getMakeMakeJacsWorkerBee()({
  ...mainProv,
  lazyRequire: true,
  cacheNodeResolve: false,
  module: "commonjs",
}) as any;

/**
 *
 */
export const getJacsBee = (
  extraDeps?: Partial<BeeDeps<any>>,
  logPrefix?: string
) => makeJacsBee(getBeeDeps(mainProv, extraDeps, logPrefix));

/**
 *
 */
export const getBeeDeps = (
  prov: MainProv,
  extraDeps?: Partial<BeeDeps<any>>,
  logPrefix = "bee."
): BeeDeps<any> => ({
  def: {
    filename: "dummy.js" as AbsoluteFile,
  },
  onMessage: (msg: unknown) => {
    prov.log(logPrefix + "message", msg);
  },
  onLog: (entry) => {
    prov.log(logPrefix + "log", entry);
  },
  onStdout: (data: Buffer | string) => {
    prov.logStream(logPrefix + "stdout", data.toString());
  },
  onStderr: (data: Buffer | string) => {
    prov.logStream(logPrefix + "stderr", data.toString());
  },
  onExit: () => {},
  onError: prov.onError,
  finally: prov.finally,
  ...extraDeps,
});
