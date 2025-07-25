import { TestProvision } from "^jarun";
import { BeeDeps, MakeBee } from "^bee-common";
import { makeMainProvToConsole } from "^main-wrapper";

import { getMakeMakeJacsWorkerBee } from "^dev/project.conf";
import { assertAbsolute } from "^jab-node/internal";
import { getBeeDeps } from ".";

//compile service

let makeJacsWorkerCached: MakeBee;

/**
 * Compile service for test cases.
 *
 *  - Take no conf or provision, because it's cached across test cases.
 *
 * todo
 *  Always used within a test with jacs active, so we could relay to the outer jacs,
 *    instead of creating new cache here.
 *
 */
export const getLiveMakeJacsWorker = (): MakeBee => {
  if (!makeJacsWorkerCached) {
    const mainProv = makeMainProvToConsole("jacs.");

    makeJacsWorkerCached = getMakeMakeJacsWorkerBee()({
      ...mainProv,
      lazyRequire: true,
      cacheNodeResolve: true,
      module: "commonjs",
    }) as unknown as MakeBee; //bug: there is a difference between dev/released version.
  }

  return makeJacsWorkerCached;
};

/**
 *
 */
export const runLiveJacsBee_lazy = (
  prov: TestProvision,
  filename: string,
  data?: unknown,
  extraDeps?: Partial<BeeDeps<any>>
) => {
  const makeBee = getLiveMakeJacsWorker();

  const bee = makeBee(
    getBeeDeps(prov, {
      def: { filename: assertAbsolute(filename), data },
      ...extraDeps,
    })
  );

  return (bee as any).waiter.await("stopped");
};
