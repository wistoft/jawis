import {
  ConsumerStates,
  CaIndex,
  getControlArray,
  requestProducerSync,
  setCompiling,
  signalConsumerSync,
  WaitFunc,
} from "^jacs/protocol";
import { ConsumerMessage } from "^jacs";
import { TestProvision } from "^jarun";

/**
 *
 */
export const syntheticWait = (
  type: "success" | "error",
  controlArray: Int32Array,
  dataArray: Uint8Array,
  data = "the result"
): WaitFunc => (arr, index, value) => {
  const curValue = arr[index];

  setCompiling(controlArray);

  // put a response into memory.
  signalConsumerSync(
    type,
    data,
    controlArray,
    dataArray,
    () => 1 /* successful notify */
  );

  if (curValue === value) {
    return "ok"; //simulate notify
  } else {
    return "not-equal";
  }
};

/**
 *
 */
export const requestProducerSync_test = (
  prov: TestProvision,
  extraDeps?: {
    controlArray?: Int32Array;
    dataArray?: Uint8Array;
    timeout?: number;
    softTimeout?: number;
    postMessage?: (msg: ConsumerMessage) => void;
    wait?: WaitFunc;
    noSoftTimeout?: boolean;
  }
) => {
  const controlArray = extraDeps?.controlArray || getControlArray();

  const dataArray =
    extraDeps?.dataArray || new Uint8Array(new SharedArrayBuffer(1000));

  const softTimeout = extraDeps?.noSoftTimeout
    ? undefined
    : extraDeps?.softTimeout || 10;

  const res = requestProducerSync(
    "myfile",
    controlArray,
    dataArray,
    extraDeps?.timeout || 20,
    softTimeout,
    extraDeps?.postMessage || (() => {}),
    extraDeps?.wait || syntheticWait("success", controlArray, dataArray)
  );

  prov.eq("ready", ConsumerStates[controlArray[CaIndex.consumer_state]]);

  prov.imp(res);
};
