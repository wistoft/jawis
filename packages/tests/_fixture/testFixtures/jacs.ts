import { CompilerOptions } from "typescript";

import { SourceFileLoader } from "^jacs";
import { assertString } from "^jab";
import { TestProvision } from "^jarun";
import { TsPathsConfig } from "^ts-config-util";
import { getAbsoluteSourceFile_dev as getAbsoluteSourceFile } from "^dev/util";

import {
  JacsConsumer,
  JacsConsumerDeps,
  JacsProducer,
  JacsProducerDeps,
  CaIndex,
  ConsumerStates,
  getControlArray,
} from "^jacs/internal";

import { syntheticWait, filterAbsoluteFilepath } from ".";

/**
 *
 */
export const load_tests = (sfl: SourceFileLoader, script: string) =>
  sfl.load(script).then((data) => data.toString());

/**
 *
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
export const getJacsProducer_in_memory = (
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
    cacheNodeResolve: false, // this producer is only used for onCompile, so no point in caching.
    doSourceMap: true,
    tsConfigPath: true,
    getAbsoluteSourceFile,

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
  const { controlArray, dataArray, producer } = getJacsProducer_in_memory(
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
    channelToken: "jacs-compile",
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
    filterAbsoluteFilepath(assertString(conf.pathsBasePath));

  return {
    ...conf,
    baseUrl: conf.baseUrl && filterAbsoluteFilepath(conf.baseUrl),
    outDir: conf.outDir && filterAbsoluteFilepath(conf.outDir),
    rootDir: conf.rootDir && filterAbsoluteFilepath(conf.rootDir),
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
      baseUrl: conf.baseUrl && filterAbsoluteFilepath(conf.baseUrl),
    };
  } else {
    return;
  }
};
