import { Bee, BeeEvents, BeeStates, Waiter, BeeDeps } from "^jab";

import { JacsProducer, JacsProducerDeps } from "./JacsProducer";
import { SourceFileLoader, SourceFileLoaderDeps } from "./SourceFileLoader";

export type MakeMakeJacsBeeDeps = Partial<
  Omit<JacsProducerDeps, "getTranspiledSource">
> &
  Pick<JacsProducerDeps, "onError" | "finally" | "cacheNodeResolve"> &
  SourceFileLoaderDeps;

/**
 * waiter is quick fix for testing.
 */
export type MakeBeeWithWaiter = <MS extends {}, MR extends {}>(
  deps: BeeDeps<MR>
) => Bee<MS> & { waiter: Waiter<BeeStates, BeeEvents> };

/**
 * Init jacs producer.
 *
 * - Only use once. To be able to share compiled results between workers.
 * - Give all the live stuff to components.
 *
 * impl
 *  - Setup the producer in first make.
 *  - Setup up worker in subsequent makes.
 *
 */
export const makeJacsProducer = (deps: MakeMakeJacsBeeDeps) => {
  const consumerTimeout = 10000; //throws
  const consumerSoftTimeout = 3000; //gives warning, but continues to wait for producer.
  const maxSourceFileSize = 256 * 1000;

  const sfl = new SourceFileLoader(deps);

  const producer = new JacsProducer({
    sfl,
    maxSourceFileSize,
    consumerTimeout,
    consumerSoftTimeout,
    ...deps,
  });

  return producer;
};

/**
 * Init jacs producer, and return a function for creating worker bees.
 *
 */
export const makeMakeJacsWorkerBee: (
  deps: MakeMakeJacsBeeDeps
) => MakeBeeWithWaiter = (deps) => makeJacsProducer(deps).makeJacsWorkerBee;
