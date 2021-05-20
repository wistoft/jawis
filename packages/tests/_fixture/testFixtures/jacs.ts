import path from "path";
import type { CompilerOptions } from "typescript";

// eslint-disable-next-line import/no-extraneous-dependencies
import { uninstall } from "@jawis/jacs";

import {
  makeMakeJacsWorkerBee,
  MakeMakeJacsBeeDeps,
  SourceFileLoader,
  WorkerData,
} from "^jacs";
import { makeTsNodeWorker } from "^util/node";
import { TestProvision } from "^jarun";

import { JacsConsumer, JacsConsumerDeps } from "^jacs/JacsConsumer";
import { JacsProducer, JacsProducerDeps } from "^jacs/JacsProducer";
import { CaIndex, ConsumerStates, getControlArray } from "^jacs/protocol";

import { assertString } from "^jab";

import { syntheticWait } from "./jacs protocol";

const projectConf = require("../../../../project.conf");

/**
 *
 */
export const load_tests = (sfl: SourceFileLoader, script: string) =>
  sfl.load(script).then((data) => data.toString());

/**
 *
 */
export const makeMakeJacsBee_test = (
  prov: TestProvision,
  extraDeps?: Partial<MakeMakeJacsBeeDeps>
) =>
  makeMakeJacsWorkerBee({
    makeWorker: makeTsNodeWorker, // to be able to compile JacsConsumerMain.ts
    unregisterTsInWorker: true,

    onError: prov.onError,
    finally: prov.finally,
    ...extraDeps,
  });

/**
 * - doesn't start the consumer thread.
 */
export const getSourceFileLoaderMock = (): Pick<
  SourceFileLoader,
  "load" | "getTsConfigPaths"
> => ({
  load: (file) => Promise.resolve("code for: " + file),
  getTsConfigPaths: () => undefined,
});

/**
 * - doesn't start the consumer thread.
 */
export const getJacsProducer = (
  prov: TestProvision,
  extraDeps?: Partial<JacsProducerDeps>
) => {
  const maxSourceFileSize = 40;

  const controlArray = getControlArray();
  const dataArray = new Uint8Array(new SharedArrayBuffer(maxSourceFileSize));

  const producer = new JacsProducer({
    consumerTimeout: 0,
    consumerSoftTimeout: 0,
    maxSourceFileSize,
    sfl: getSourceFileLoaderMock(),
    onError: prov.onError,
    finally: prov.finally,

    ...extraDeps,
  });

  return { controlArray, dataArray, producer };
};

/**
 *
 */
export const makeProducerOnCompile = (
  prov: TestProvision,
  extraDeps?: Partial<JacsProducerDeps>
) => {
  const { controlArray, dataArray, producer } = getJacsProducer(
    prov,
    extraDeps
  );

  const onCompile = (file: string) => {
    Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.requesting); // prettier-ignore

    return producer
      .onCompile(controlArray, dataArray, file)
      .then(() => ({ controlArray, dataArray }));
  };

  return { controlArray, dataArray, onCompile };
};

/**
 *
 */
export const getWorkerData = (extraDeps?: Partial<WorkerData>): WorkerData => {
  const controlArray = getControlArray();

  const dataArray = new Uint8Array(new SharedArrayBuffer(40));

  return {
    controlArray,
    dataArray,
    timeout: 0,
    softTimeout: 0,
    unregister: false,
    tsPaths: {
      baseUrl: "E:\\work\\repos\\jawis",
      paths: { "^*": ["./packages/*"] },
    },
    ...extraDeps,
  };
};

/**
 *
 */
export const getConsumer = (
  prov: TestProvision,
  extraDeps?: Partial<JacsConsumerDeps>,
  extraControlArray?: Int32Array
) => {
  const controlArray = extraControlArray || getControlArray();

  const dataArray = new Uint8Array(new SharedArrayBuffer(40));

  const shared = {
    controlArray,
    dataArray,
    timeout: 0,
    softTimeout: 0,
  };

  const consumer = new JacsConsumer({
    shared,
    onError: prov.onError,
    postMessage: (msg) => {
      prov.imp("postMessage");
      prov.imp(msg);
    },
    wait: syntheticWait("success", controlArray, dataArray),
    ...extraDeps,
  });

  return { controlArray, dataArray, consumer };
};

/**
 *
 */
export const filterTsConfig = (conf: CompilerOptions) => {
  //quick fix: only supports string value.
  const pathsBasePath =
    conf.pathsBasePath &&
    path
      .relative(projectConf.projectRoot, assertString(conf.pathsBasePath))
      .replace(/\\/g, "/");

  return {
    ...conf,
    baseUrl: conf.baseUrl && path.relative(projectConf.projectRoot, conf.baseUrl).replace(/\\/g, "/"), // prettier-ignore
    outDir: conf.outDir && path.relative(projectConf.projectRoot, conf.outDir).replace(/\\/g, "/"), // prettier-ignore
    rootDir: conf.rootDir && path.relative(projectConf.projectRoot, conf.rootDir).replace(/\\/g, "/"), // prettier-ignore
    pathsBasePath,
  };
};

/**
 * It's needed to use uninstall from 'live' jacs. In order to test the development version.
 *  Live might be '@jawis/jacs' or 'alpha build jacs'
 */
export const uninstallLiveJacs = () => {
  uninstall();
};
