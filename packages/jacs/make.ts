import { MakeBee } from "^jab-node";

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
  const producerTimeout = 2000;
  const consumerTimeout = 1000;
  const maxSourceFileSize = 256 * 1000;

  const sfl = new SourceFileLoader(deps);

  const producer = new JacsProducer({
    sfl,
    maxSourceFileSize,
    producerTimeout,
    consumerTimeout,
    ...deps,
  });

  return producer.makeJacsWorkerBee;
};
