import { TestProvision } from "^jarun";
import {
  CaIndex,
  ConsumerStates,
  getControlArray,
  ProducerStates,
  signalConsumerSync,
} from "^jacs/protocol";

// source code can exactly fit

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  const dataArray = new Uint8Array(new SharedArrayBuffer(10));

  //some stuff

  Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.requesting); // prettier-ignore
  Atomics.store(controlArray, CaIndex.producer_state, ProducerStates.compiling); // prettier-ignore

  // put a response into memory.

  signalConsumerSync(
    "success",
    "01234\u20ac",
    controlArray,
    dataArray,
    () => 0
  );

  prov.imp(controlArray);
  prov.imp(dataArray);
};
