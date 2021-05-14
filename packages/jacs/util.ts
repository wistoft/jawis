import nativeModule from "module";
import { nodeRequire } from "^jab-node";
import { UninstallInfo } from "^jacs";
import {
  CaIndex,
  ConsumerShould,
  ConsumerStates,
  ProducerStates,
  ResultType,
} from "./protocol";

/**
 * This is hacky
 *
 */
export const unRegisterTsCompiler = () => {
  delete nodeRequire.extensions[".ts"];
  delete nodeRequire.extensions[".tsx"];
};

/**
 * This is hacky
 *
 * bug
 *  - Error.prepareStackTrace wont be reinstalled by source-map-support. But happily, jacs has its own.
 */
export const unRegisterSourceMapSupport = (uninstallInfo: UninstallInfo) => {
  (nativeModule.prototype as any)._compile = uninstallInfo._compile;
  Error.prepareStackTrace = uninstallInfo.prepareStackTrace;
};

/**
 *
 */
export const getDebugSummary = (
  file: string,
  controlArray: Int32Array,
  timeout: number,
  softTimeout?: number
) => {
  const resultType = controlArray[CaIndex.result_type] as ResultType; // prettier-ignore
  const dataLength = controlArray[CaIndex.data_length];
  const consumerState = ConsumerStates[controlArray[CaIndex.consumer_state]]; // prettier-ignore
  const postProducerState = ProducerStates[controlArray[CaIndex.producer_state]]; // prettier-ignore
  const shouldSleep = ConsumerShould[controlArray[CaIndex.sleep_bit]];

  return {
    file,
    consumerState,
    producerState: postProducerState,
    resultType: ResultType[resultType],
    dataLength,
    shouldSleep,
    timeout,
    softTimeout,
  };
};
