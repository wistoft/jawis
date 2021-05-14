import { TestProvision } from "^jarun";
import { CaIndex, getControlArray } from "^jacs/protocol";
import { requestProducerSync_test } from "../_fixture";

// noise in sleep bit

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  Atomics.store(controlArray, CaIndex.sleep_bit, 41234);

  requestProducerSync_test(prov, {
    controlArray,
  });
};
