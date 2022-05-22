// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "^released/jacs";

import { mainProvToConsole, ProcessDeps } from "^jab-node";
import { getBeeDeps } from "^tests/_fixture";

const mainProv = mainProvToConsole();

const makeJacsBee = makeMakeJacsWorkerBee({
  ...mainProv,
  cacheNodeResolve: true,
  lazyRequire: true,
});

/**
 *
 */
export const getJacsBee = (
  extraDeps?: Partial<ProcessDeps<any>>,
  logPrefix?: string
) => makeJacsBee(getBeeDeps(mainProv, extraDeps, logPrefix));
