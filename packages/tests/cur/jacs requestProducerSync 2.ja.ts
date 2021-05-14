import { TestProvision } from "^jarun";
import { getControlArray } from "^jacs/protocol";
import { requestProducerSync_test, syntheticWait } from "../_fixture";

// compile failed

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  const dataArray = new Uint8Array(new SharedArrayBuffer(1000));

  requestProducerSync_test(prov, {
    controlArray,
    dataArray,
    wait: syntheticWait("error", controlArray, dataArray, "the error messages"),
  });
};
//
