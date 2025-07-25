import path from "node:path";

import { TestProvision } from "^jarun";
import {
  WatchableProcessPreloaderDeps,
  WatchableProcessPreloader,
} from "^process-util";
import { BeeDeps } from "^bee-common";
import { getDynamicWaiter } from "^state-waiter";
import { getAbsoluteSourceFile_dev as getAbsoluteSourceFile } from "^dev/util";
import { RequireSenderMessage } from "^process-util/internal";

import {
  getLogProv,
  getScriptPath,
  getLiveMakeJacsWorker,
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
  getBeeDeps,
  filterAbsoluteFilepath,
} from ".";

/**
 * - Doesn't exit by it self
 * - A script, that loads the library files
 */
export const getJabWatchableProcessAndWaiter_ipc_changeable = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & BeeDeps<any>>
) =>
  getJabWatchableProcess_nonIpc_changeable(prov, {
    def: { filename: getScriptPath("WPP_wait.js") },
    ...extraDeps,
  }).then(({ wp, waiter }) =>
    waiter.await("message").then(() => ({ wp, waiter }))
  );

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
    onMessage: (msg) => {
      prov.log("message", msg);
    },
  });
};

/**
 *
 */
export const getJabWatchableProcess = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & BeeDeps<any>>
) => {
  const { waiter, callbacks } = getDynamicWaiter(
    ["message", "restarted", "exit"],
    prov.onError
  );

  const [wpp, deps] = getJabWatchableProcessPreloaderAndDeps(prov, {
    onExit: callbacks.exit,
    onError: waiter.onError,

    ...extraDeps,

    onRestartNeeded: () => {
      callbacks.restarted();
      extraDeps?.onRestartNeeded?.();
      prov.imp("onRestartNeeded");
    },
    onMessage: (msg: any) => {
      callbacks.message();
      extraDeps?.onMessage?.(msg);
    },
  });

  return wpp.useBee(deps).then((wp) => ({ wp, waiter }));
};

/**
 *
 */
export const getJabWatchableProcessPreloaderAndDeps = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & BeeDeps<any>>,
  logPrefix?: string
): [
  WatchableProcessPreloader<any, any>,
  WatchableProcessPreloaderDeps & BeeDeps<any>,
] => {
  const deps = getJabWatchbleProcessPreloaderDeps(prov, extraDeps, logPrefix);

  const wpp = new WatchableProcessPreloader(deps);

  return [wpp, deps];
};

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

    makeBee: getLiveMakeJacsWorker(),
    logProv: getLogProv(prov, logPrefix),
    getAbsoluteSourceFile,
  };
};

/**
 *
 */
export const logRequireMessage = (msg: RequireSenderMessage) => {
  const file = filterAbsoluteFilepath(msg.file);
  if (!file.startsWith("abs:packages")) {
    return;
  }

  console.log({
    ...msg,
    file,
    source: msg.source && path.basename(msg.source),
  });
};
