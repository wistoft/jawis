// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "@jawis/jacs";

import { mainProvToConsole, ProcessDeps } from "^jab-node";
import { getJabProcessDeps } from "^tests/_fixture/testFixtures/jab Process";

const mainProv = mainProvToConsole();

const makeJacsBee = makeMakeJacsWorkerBee(mainProv);

/**
 *
 */
export const getJacsBee = (
  extraDeps?: Partial<ProcessDeps<any>>,
  logPrefix?: string
) => makeJacsBee(getJabProcessDeps(mainProv, extraDeps, logPrefix));
