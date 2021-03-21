import { TestProvision } from "^jarun";
import {
  CaIndex,
  ConsumerStates,
  getControlArray,
  ProducerStates,
  signalConsumerSync,
} from "^jacs/protocol";

// utf-8 encoding makes the source code too large

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  const dataArray = new Uint8Array(new SharedArrayBuffer(9));

  //some stuff

  Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.requesting); // prettier-ignore
  Atomics.store(controlArray, CaIndex.producer_state, ProducerStates.compiling); // prettier-ignore

  // put a response into memory.

  signalConsumerSync(
    "success",
    "1234567\u20ac",
    controlArray,
    dataArray,
    () => 0
  );
};
