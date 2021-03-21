import { TestProvision } from "^jarun";
import { getControlArray } from "^jacs/protocol";
import { requestProducerSync_test, syntheticWait } from "../_fixture";

// spurious wake

export default (prov: TestProvision) => {
  const controlArray = getControlArray();
  const dataArray = new Uint8Array(new SharedArrayBuffer(1000));

  let count = 0;

  requestProducerSync_test(prov, {
    controlArray,
    dataArray,
    wait: (...args) => {
      count++;
      if (count < 5) {
        //spurious
        return "ok";
      } else {
        //actual wait
        return syntheticWait(
          "success",
          controlArray,
          dataArray,
          "succes after: " + count
        )(...args);
      }
    },
  });
};
