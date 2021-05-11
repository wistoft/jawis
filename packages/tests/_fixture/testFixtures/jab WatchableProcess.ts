import { TestProvision } from "^jarun";
import {
  ProcessDeps,
  WatchableProcessPreloaderDeps,
  WatchableProcessPreloader,
} from "^jab-node";

import { getJabProcessDeps, getLogProv, getScriptPath } from ".";
import { makeJacsWorker } from "../util/diverse jacs compile";
import {
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
} from "../util/diverse";

/**
 *
 */
export const getJabWatchableProcessPreloaderAndDeps = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps>,
  logPrefix?: string
): [
  WatchableProcessPreloader<any, any>,
  WatchableProcessPreloaderDeps & ProcessDeps<any>
] => {
  const deps = getJabWatchbleProcessPreloaderDeps(prov, extraDeps, logPrefix);

  const wpp = new WatchableProcessPreloader(deps);

  return [wpp, deps];
};

/**
 *
 */
export const getJabWatchableProcess = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & ProcessDeps<any>>
) => {
  const [wpp, deps] = getJabWatchableProcessPreloaderAndDeps(prov, extraDeps);

  return wpp.useProcess(deps);
};

/**
 * - Exits by it self
 * - A script, that loads the library files
 */
export const getJabWatchableProcess_nonIpc_changeable = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & ProcessDeps<any>>
) => {
  writeScriptFileThatChanges(144);
  writeScriptFileThatChanges2(355);

  return getJabWatchableProcess(prov, {
    filename: getScriptPath("WPP.js"),
    ...extraDeps,
  });
};

/**
 * - Doesn't exit by it self
 * - A script, that loads the library files
 */
export const getJabWatchableProcess_ipc_changeable = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & ProcessDeps<any>>
) =>
  getJabWatchableProcess_nonIpc_changeable(prov, {
    filename: getScriptPath("WPP_wait.js"),
    ...extraDeps,
  });

/**
 *
 */
export const getJabWatchbleProcessPreloaderDeps = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & ProcessDeps<any>>,
  logPrefix?: string
): WatchableProcessPreloaderDeps & ProcessDeps<any> => {
  const procDeps = getJabProcessDeps(
    prov,
    {
      filename: getScriptPath("beeSendAndWait.js"),
      onMessage: () => {
        //hidden, because all those require messages are anoying
      },
      ...extraDeps,
    },
    logPrefix
  );

  return {
    onRestartNeeded: () => {
      prov.imp("onRestartNeeded.");
    },

    onScriptRequired: () => {
      //too noisy, to include in all tests.
    },

    ...procDeps,

    makeBee: makeJacsWorker,
    logProv: getLogProv(prov, logPrefix),
  };
};
