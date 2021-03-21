import { TestProvision } from "^jarun";
import {
  CaIndex,
  getControlArray,
  setCompiling,
  ConsumerStates,
} from "^jacs/protocol";

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.requesting); // prettier-ignore

  setCompiling(controlArray);
  setCompiling(controlArray); //not protocol
};
