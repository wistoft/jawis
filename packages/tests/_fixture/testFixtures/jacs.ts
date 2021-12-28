import type { CompilerOptions } from "typescript";

import { uninstall, SourceFileLoader, WorkerData, TsPathsConfig } from "^jacs";
import { assertString } from "^jab";

import { TestProvision } from "^jarun";

import { JacsConsumer, JacsConsumerDeps } from "^jacs/JacsConsumer";
import { JacsProducer, JacsProducerDeps } from "^jacs/JacsProducer";
import { CaIndex, ConsumerStates, getControlArray } from "^jacs/protocol";
import { syntheticWait } from "./jacs protocol";
import { filterFilepath } from ".";

const projectConf = require("../../../../project.conf");

/**
 *
 */
export const load_tests = (sfl: SourceFileLoader, script: string) =>
  sfl.load(script).then((data) => data.toString());

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
    cacheNodeResolve: false, // this producer is only used by for onCompile, so no point in caching.

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
    jacsCompileToken: "jacs-compile",
    unregister: false,
    tsPaths: {
      baseUrl: projectConf.projectRoot,
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
    jacsCompileToken: "jacs-compile",
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
    conf.pathsBasePath && filterFilepath(assertString(conf.pathsBasePath));

  return {
    ...conf,
    baseUrl: conf.baseUrl && filterFilepath(conf.baseUrl),
    outDir: conf.outDir && filterFilepath(conf.outDir),
    rootDir: conf.rootDir && filterFilepath(conf.rootDir),
    pathsBasePath,
  };
};

/**
 *
 */
export const filterTsPathConfig = (conf: TsPathsConfig | undefined) => {
  if (conf) {
    return {
      ...conf,
      baseUrl: conf.baseUrl && filterFilepath(conf.baseUrl),
    };
  } else {
    return undefined;
  }
};

/**
 * Actually just the same function as in development.
 */
export const uninstallLiveJacs = () => {
  uninstall();
};
