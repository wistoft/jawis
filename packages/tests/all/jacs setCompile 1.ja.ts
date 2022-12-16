import { TestProvision } from "^jarun";
import {
  CaIndex,
  getControlArray,
  setCompiling,
  ProducerStates,
  ConsumerStates,
} from "^jacs/protocol";

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.requesting); // prettier-ignore

  setCompiling(controlArray);

  prov.eq(ProducerStates.compiling, controlArray[CaIndex.producer_state]);
};
