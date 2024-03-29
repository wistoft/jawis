import { TestProvision } from "^jarun";
import {
  ProcessListeners,
  ProcessPreloaderDeps,
  ProcessPreloader,
} from "^jab-node";

import {
  getLogProv,
  getJabProcessDeps,
  getScriptPath,
  makeDormentInMemoryBee,
  getLiveMakeJacsWorker,
} from ".";

/**
 *
 */
export const getJabProcessPreloader_new = (prov: TestProvision) => {
  const [pp] = getJabProcessPreloaderAndDeps(prov, {
    makeBee: makeDormentInMemoryBee,
  });

  return pp;
};

/**
 *
 */
export const getJabProcessPreloader = (
  prov: TestProvision,
  extraDeps?: Partial<ProcessPreloaderDeps>
) => {
  const [pp] = getJabProcessPreloaderAndDeps(prov, extraDeps);

  return pp;
};

/**
 *
 */
export const getJabProcessPreloaderAndDeps = (
  prov: TestProvision,
  extraDeps?: Partial<ProcessPreloaderDeps>,
  logPrefix = "UsedProcessPreloader."
): [ProcessPreloader<any>, ProcessPreloaderDeps & ProcessListeners<any>] => {
  const deps = getJabProcessPreloaderDeps(prov, extraDeps, logPrefix);

  const pp = new ProcessPreloader(deps);

  return [pp, deps];
};

/**
 *
 */
export const getJabProcessPreloaderDeps = (
  prov: TestProvision,
  extraDeps?: Partial<ProcessPreloaderDeps>,
  logPrefix?: string
): ProcessPreloaderDeps & ProcessListeners<any> => {
  const procDeps = getJabProcessDeps(
    prov,
    {
      filename: getScriptPath("beeSendAndWait.js"),
      ...extraDeps,
    },
    logPrefix
  );

  return {
    makeBee: getLiveMakeJacsWorker(),
    logProv: getLogProv(prov, ""),
    ...procDeps,
  };
};
