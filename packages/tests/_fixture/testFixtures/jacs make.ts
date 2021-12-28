import { WorkerOptions } from "worker_threads";

import { getPromise, WorkerBeeDeps } from "^jab";
import { MakeMakeJacsBeeDeps, makeJacsProducer } from "^jacs";

import { makeTsNodeWorker } from "^util-javi/node";
import { TestProvision } from "^jarun";
import { TS_TIMEOUT } from "^jab-node";

import { getBeeDeps } from ".";

/**
 * todo: makes no sense to take param.
 */
export const cacheValue = <T, A1>(func: (a1: A1) => T) => {
  let value: T;

  return (a1: A1) => {
    if (!value) {
      value = func(a1);
    }
    return value;
  };
};

/**
 *
 */
export const makeTsWorker_test = (
  prov: TestProvision,
  filename: string,
  options?: WorkerOptions
) => {
  const prom = getPromise();

  const producer = getProducer_lazy(prov);

  const worker = producer.makeTsWorker(filename, options);

  worker.addListener("exit", prom.resolve);

  return { worker, exitPromise: prom.promise };
};

/**
 *
 */
export const makeJacs_lazy = (
  prov: TestProvision,
  filename: string,
  extraDeps?: Partial<WorkerBeeDeps<any>>
) => {
  const bee = getProducer_lazy(prov).makeJacsWorkerBee(
    getBeeDeps(prov, {
      filename,
      ...extraDeps,
    })
  );

  return bee.waiter.await("stopped", 2 * TS_TIMEOUT);
};

/**
 *
 */
export const makeJacs_eager = (prov: TestProvision, filename: string) => {
  const bee = getProducer_eager(prov).makeJacsWorkerBee(
    getBeeDeps(prov, {
      filename,
    })
  );

  return bee.waiter.await("stopped", 2 * TS_TIMEOUT);
};

/**
 * There's a problem with sharing, because onError and finally are the one's from the first test case.
 */
export const getProducer_lazy = cacheValue((prov: TestProvision) =>
  makeJacsProducer_test(prov)
);

/**
 *
 */
export const getProducer_eager = cacheValue((prov: TestProvision) =>
  makeJacsProducer_test(prov, {
    lazyRequire: false,
  })
);

/**
 *
 */
export const makeJacsProducer_test = (
  prov: TestProvision,
  extraDeps?: Partial<MakeMakeJacsBeeDeps>
) =>
  makeJacsProducer({
    makeWorker: makeTsNodeWorker,
    unregisterTsInWorker: true,
    lazyRequire: true,
    cacheNodeResolve: true,

    onError: prov.onError,
    finally: prov.finally,
    ...extraDeps,
  });
