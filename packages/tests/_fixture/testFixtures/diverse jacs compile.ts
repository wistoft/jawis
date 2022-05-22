import { MakeBee, BeeDeps } from "^jab";
import { mainProvToConsole } from "^jab-node";
import { TestProvision } from "^jarun";

// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "^released/jacs";
import { getBeeDeps } from ".";

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

    makeJacsWorkerCached = makeMakeJacsWorkerBee({
      ...mainProv,
      cacheNodeResolve: true,
      lazyRequire: true,
    }) as unknown as MakeBee; //bug: there is a different between dev/released version.
  }

  return makeJacsWorkerCached;
};

export const makeLiveJacs_lazy = (
  prov: TestProvision,
  filename: string,
  data?: unknown,
  extraDeps?: Partial<BeeDeps<any>>
) => {
  const makeBee = getMakeJacsWorker();

  const bee = makeBee(
    getBeeDeps(prov, {
      def: { filename, data },
      ...extraDeps,
    })
  );

  return (bee as any).waiter.await("stopped", 10000); //timeout needed on '1.0.2-dev.1'
};
