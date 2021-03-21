import { TestProvision } from "^jarun";
import { CaIndex, getControlArray, ConsumerShould } from "^jacs/protocol";
import { requestProducerSync_test } from "../_fixture";

// producer hasn't set result type

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  requestProducerSync_test(prov, {
    controlArray,
    wait: () => {
      Atomics.store(controlArray, CaIndex.sleep_bit, ConsumerShould.work); //ensure consumer know it should work.
      Atomics.store(controlArray, CaIndex.data_length, 123);

      return "ok";
    },
  });
};
//
