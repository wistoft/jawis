import { TestProvision } from "^jarun";
import {
  WatchableProcessPreloaderDeps,
  WatchableProcessPreloader,
} from "^jab-node";

import {
  getBeeDeps,
  getLogProv,
  getMakeJacsWorker,
  getScriptPath,
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
} from ".";
import { BeeDeps } from "^jabc";

/**
 *
 */
export const getJabWatchableProcessPreloaderAndDeps = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps>,
  logPrefix?: string
): [
  WatchableProcessPreloader<any>,
  WatchableProcessPreloaderDeps & BeeDeps<any>
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
  extraDeps?: Partial<WatchableProcessPreloaderDeps & BeeDeps<any>>
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
  extraDeps?: Partial<WatchableProcessPreloaderDeps & BeeDeps<any>>
) => {
  writeScriptFileThatChanges(144);
  writeScriptFileThatChanges2(355);

  return getJabWatchableProcess(prov, {
    def: { filename: getScriptPath("WPP.js") },
    ...extraDeps,
  });
};

/**
 * - Doesn't exit by it self
 * - A script, that loads the library files
 */
export const getJabWatchableProcess_ipc_changeable = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & BeeDeps<any>>
) =>
  getJabWatchableProcess_nonIpc_changeable(prov, {
    def: { filename: getScriptPath("WPP_wait.js") },
    ...extraDeps,
  });

/**
 *
 */
export const getJabWatchbleProcessPreloaderDeps = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & BeeDeps<any>>,
  logPrefix?: string
): WatchableProcessPreloaderDeps & BeeDeps<any> => {
  const procDeps = getBeeDeps(
    prov,
    {
      def: { filename: getScriptPath("beeSendAndWait.js") },
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

    makeBee: getMakeJacsWorker(),
    logProv: getLogProv(prov, logPrefix),
  };
};
