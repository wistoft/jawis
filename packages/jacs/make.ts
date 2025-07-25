import { Bee, BeeEvents, BeeStates, BeeDeps } from "^bee-common";
import { Waiter } from "^state-waiter";

import { FinallyFunc } from "^finally-provider";
import {
  JacsProducer,
  JacsProducerDeps,
  SourceFileLoader,
  SourceFileLoaderDeps,
} from "./internal";

/**
 * waiter is quick fix for testing.
 */
export type MakeBeeWithWaiter = <MS extends {}, MR extends {}>(
  deps: BeeDeps<MR>
) => Bee<MS> & { waiter: Waiter<BeeStates, BeeEvents> };

export type MakeMakeJacsBeeDeps = {
  onError: (error: unknown) => void;
  finally: FinallyFunc;
} & Partial<JacsProducerDeps> &
  Partial<SourceFileLoaderDeps>;

export type JacsConf = {
  lazyRequire: boolean;
  module: "commonjs" | "esm";
  consumerTimeout: number;
  consumerSoftTimeout: number;
  maxSourceFileSize: number;
  cacheNodeResolve: boolean;
  tsConfigPath: boolean;
  doSourceMap: boolean;
};

//to make it easier for hive to get its conf
export const jacsDefaultDeps: JacsConf = {
  lazyRequire: false,
  module: "commonjs",
  consumerTimeout: 10000,
  consumerSoftTimeout: 3000,
  maxSourceFileSize: 256 * 1000,
  cacheNodeResolve: false,
  tsConfigPath: true,
  doSourceMap: true,
};

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
  const sfl = new SourceFileLoader({
    ...jacsDefaultDeps,
    ...deps,
    lazyRequireIndexFiles: false,
  });

  const producer = new JacsProducer({
    sfl,
    ...jacsDefaultDeps,
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
