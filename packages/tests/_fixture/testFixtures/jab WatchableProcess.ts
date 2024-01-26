import { TestProvision } from "^jarun";
import {
  ProcessDeps,
  WatchableProcessPreloaderDeps,
  WatchableProcessPreloader,
} from "^jab-node";

import { getPromise } from "^yapu";
import {
  getJabProcessDeps,
  getLogProv,
  getScriptPath,
  getLiveMakeJacsWorker,
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
} from ".";

/**
 * This is a quick fix, because shutdown has to low timeout.
 */
export const shutdownQuickFix = async (process: {
  shutdown: () => Promise<any>;
}) => {
  try {
    await process.shutdown();
  } catch (error: any) {
    if (error.message.includes("Timeout waiting for: stopped")) {
      await (process as any).waiter.rawAwait("stopped", 10000);
    } else {
      throw error;
    }
  }
};

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
export const getJabWatchableProcess_ipc_changeable = async (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps & ProcessDeps<any>>
) => {
  const booterIsReady = getPromise<void>();
  const hasRestarted = getPromise<void>();

  const wp = await getJabWatchableProcess_nonIpc_changeable(prov, {
    filename: getScriptPath("WPP_wait.js"),
    ...extraDeps,

    onMessage: (msg: any) => {
      if (msg.type === "msg" && msg.value === "hello") {
        booterIsReady.resolve();
      }
      prov.log("onMessage", msg);
      extraDeps?.onMessage?.(msg);
    },

    onRestartNeeded: () => {
      hasRestarted.resolve();
      prov.imp("onRestartNeeded.");
      extraDeps?.onRestartNeeded?.();
    },
  });

  await booterIsReady.promise;

  return { wp, hasRestarted: hasRestarted.promise };
};

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
      onMessage: (msg) => {
        prov.log("onMessage", msg);
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
  };
};
