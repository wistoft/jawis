import { mainProvToConsole, MakeBee } from "^jab-node";

// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "@wistoft/jacs";

//compile service

const mainProv = mainProvToConsole("jacs.");

export const makeJacsBee = (makeMakeJacsWorkerBee(
  mainProv
) as unknown) as MakeBee; //bug: there is a different between dev/released version.
