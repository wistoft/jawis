import { BeePreloaderDeps, BeePreloader, BeeDeps } from "^bee-common";
import { TestProvision } from "^jarun";

import {
  getLogProv,
  getScriptPath,
  makeDormentInMemoryBee,
  getLiveMakeJacsWorker,
  getBeeDeps,
} from "./index";

/**
 *
 */
export const getJabBeePreloader = (prov: TestProvision) => {
  const [pp] = getJabBeePreloaderAndDeps(prov, {
    makeBee: makeDormentInMemoryBee,
  });

  return pp;
};

/**
 *
 */
export const getJabBeePreloaderAndDeps = (
  prov: TestProvision,
  extraDeps?: Partial<BeePreloaderDeps & BeeDeps<any>>,
  logPrefix?: string
): [BeePreloader<any, any>, BeePreloaderDeps & BeeDeps<any>] => {
  const deps = getJabBeePreloaderDeps(prov, extraDeps, logPrefix);

  const pp = new BeePreloader(deps);

  return [pp, deps];
};

/**
 *
 */
export const getJabBeePreloaderDeps = (
  prov: TestProvision,
  extraDeps?: Partial<BeePreloaderDeps & BeeDeps<any>>,
  logPrefix?: string
): BeePreloaderDeps & BeeDeps<any> => {
  const beeDeps = getBeeDeps(
    prov,
    {
      def: { filename: getScriptPath("beeSendAndWait.js") },
      ...extraDeps,
    },
    logPrefix
  );

  return {
    ...beeDeps,
    makeBee: getLiveMakeJacsWorker(),
    logProv: getLogProv(prov, ""),
  };
};
