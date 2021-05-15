import { getControlArray } from "^jacs/protocol";
import { TestProvision } from "^jarun";
import { requestProducerSync_test, syntheticWait } from "../_fixture";

// consumer responds between soft and hard timeout.

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  const dataArray = new Uint8Array(new SharedArrayBuffer(1000));

  let first = true;

  requestProducerSync_test(prov, {
    controlArray,
    dataArray,
    wait: (...args) => {
      if (first) {
        first = false;
        return "timed-out";
      } else {
        return syntheticWait("success", controlArray, dataArray)(...args);
      }
    },
  });
};
