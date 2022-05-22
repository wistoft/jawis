import { TestProvision } from "^jarun";
import { ProcessRestarter, ProcessRestarterDeps } from "^jab-node";

import { getLogProv, getScriptPath, makeInMemoryWppMain } from ".";

/**
 *
 */
export const getProcessRestarter = (
  prov: TestProvision,
  extraDeps?: Partial<ProcessRestarterDeps<any>>
) =>
  new ProcessRestarter(
    getJarunProcessRestarterDeps(prov, "jarunProcess.", {
      finally: prov.finally,
      ...extraDeps,
    })
  );

/**
 *
 */
export const getProcessRestarter_running = (
  prov: TestProvision,
  extraDeps?: Partial<ProcessRestarterDeps<any>>
) => {
  const jpr = getProcessRestarter(prov, extraDeps);

  jpr.firstInitProcess();

  return jpr.waiter.await("running").then(() => jpr);
};

/**
 *
 */
export const getJarunProcessRestarterDeps = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<ProcessRestarterDeps<any>>
): ProcessRestarterDeps<any> => ({
  def: { filename: getScriptPath("silentWait.js") },

  makeBee: makeInMemoryWppMain,

  onMessage: (msg) => {
    prov.log(logPrefix + "onMessage", msg);
  },

  onLog: (entry) => {
    prov.log(logPrefix + "onLog", entry);
  },

  onStdout: (data) => {
    prov.logStream(logPrefix + "stdout", data.toString());
  },

  onStderr: (data) => {
    prov.logStream(logPrefix + "stderr", data.toString());
  },

  onRestarted: () => {
    prov.imp("onRestarted");
  },

  onUnexpectedExit: () => {
    prov.imp("onUnexpectedExit");
  },

  finally: prov.finally,
  onError: prov.onError,
  logProv: getLogProv(prov, logPrefix),
  ...extraDeps,
});
