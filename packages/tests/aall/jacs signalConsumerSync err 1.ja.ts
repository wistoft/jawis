import { TestProvision } from "^jarun";
import {
  CaIndex,
  ConsumerStates,
  getControlArray,
  ProducerStates,
  signalConsumerSync,
} from "^jacs/protocol";

// source code is too large.

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  const dataArray = new Uint8Array(new SharedArrayBuffer(9));

  //some stuff

  Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.requesting); // prettier-ignore
  Atomics.store(controlArray, CaIndex.producer_state, ProducerStates.compiling); // prettier-ignore

  // put a response into memory.

  signalConsumerSync("success", "0123456789", controlArray, dataArray, () => 0);
};
