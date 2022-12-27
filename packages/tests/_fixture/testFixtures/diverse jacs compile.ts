// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "@jawis/jacs";
import { MakeBee } from "^bee-common";
import { mainProvToConsole } from "^jab-node";

//compile service

const mainProv = mainProvToConsole("jacs.");

export const makeJacsWorker = makeMakeJacsWorkerBee(
  mainProv
) as unknown as MakeBee; //bug: there is a different between dev/released version.
