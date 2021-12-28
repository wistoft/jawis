import { TestProvision } from "^jarun";
import { ProcessPreloaderDeps, ProcessPreloader } from "^jab-node";

import {
  getLogProv,
  getJabProcessDeps,
  getScriptPath,
  makeDormentInMemoryBee,
  getMakeJacsWorker,
} from ".";
import { BeeListeners } from "^jabc";

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
export const getJabProcessPreloader = (prov: TestProvision) => {
  const [pp] = getJabProcessPreloaderAndDeps(prov);

  return pp;
};

/**
 *
 */
export const getJabProcessPreloaderAndDeps = (
  prov: TestProvision,
  extraDeps?: Partial<ProcessPreloaderDeps>,
  logPrefix = "UsedProcessPreloader."
): [ProcessPreloader<any>, ProcessPreloaderDeps & BeeListeners<any>] => {
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
): ProcessPreloaderDeps & BeeListeners<any> => {
  const procDeps = getJabProcessDeps(
    prov,
    {
      filename: getScriptPath("beeSendAndWait.js"),
      ...extraDeps,
    },
    logPrefix
  );

  return {
    ...procDeps,
    makeBee: getMakeJacsWorker(),
    logProv: getLogProv(prov, ""),
  };
};
