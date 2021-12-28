import { MakeBee } from "^jab";
import { mainProvToConsole } from "^jab-node";

// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "^released/jacs";

//compile service

let makeJacsWorkerCached: MakeBee;

/**
 * Compile service for test cases.
 *
 * todo
 *  Always used within a test with jacs active, so we could relay to the outer jacs,
 *    instead of creating new cache here.
 *
 */
export const getMakeJacsWorker = (): MakeBee => {
  if (!makeJacsWorkerCached) {
    const mainProv = mainProvToConsole("jacs.");

    makeJacsWorkerCached = (makeMakeJacsWorkerBee({
      ...mainProv,
      // cacheNodeResolve: true,
      // lazyRequire: true,
    }) as unknown) as MakeBee; //bug: there is a different between dev/released version.
  }

  return makeJacsWorkerCached;
};
