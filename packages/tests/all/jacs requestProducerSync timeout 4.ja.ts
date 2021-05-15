import { TestProvision } from "^jarun";
import { getControlArray } from "^jacs/protocol";
import { requestProducerSync_test } from "../_fixture";

// no soft timeout, so `timeout` is send to wait function.

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  const dataArray = new Uint8Array(new SharedArrayBuffer(1000));

  requestProducerSync_test(prov, {
    controlArray,
    dataArray,
    timeout: 100,
    wait: (typedArray, index, value, timeout) => {
      prov.eq(100, timeout); // a lot of work, to just do this.

      return "timed-out";
    },
    noSoftTimeout: true,
  });
};
//
