import { TestProvision } from "^jarun";
import { CaIndex, getControlArray, ProducerStates } from "^jacs/protocol";
import { requestProducerSync_test } from "../_fixture";

// producer in wrong state at request

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  Atomics.store(controlArray, CaIndex.producer_state, ProducerStates.compiling); // prettier-ignore

  requestProducerSync_test(prov, {
    controlArray,
  });
};
//
