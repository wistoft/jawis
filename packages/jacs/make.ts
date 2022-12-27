import { MakeBee } from "^bee-common";

import { JacsProducer, JacsProducerDeps } from "./JacsProducer";
import { SourceFileLoader } from "./SourceFileLoader";

export type MakeMakeJacsBeeDeps = Partial<
  Omit<JacsProducerDeps, "getTranspiledSource">
> &
  Pick<JacsProducerDeps, "onError" | "finally">;

/**
 * Init jacs producer, and return a function for creating workers.
 *
 * - Only use once. To be able to shared compiled results between workers.
 * - Give all the live stuff to components.
 *
 * impl
 *  - Setup the producer in first make.
 *  - Setup up worker in subsequent makes.
 *
 */
export const makeMakeJacsWorkerBee: (deps: MakeMakeJacsBeeDeps) => MakeBee = (
  deps
) => {
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

  return producer.makeJacsWorkerBee;
};
