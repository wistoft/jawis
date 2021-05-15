import { TestProvision } from "^jarun";
import { err } from "^jab";
import {
  getControlArray,
  setCompiling,
  signalConsumerSync,
} from "^jacs/protocol";
import { requestProducerSync_test } from "../_fixture";

// producer does all its work before consumer sleeps

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  const dataArray = new Uint8Array(new SharedArrayBuffer(1000));

  requestProducerSync_test(prov, {
    controlArray,
    dataArray,
    postMessage: (msg) => {
      setCompiling(controlArray);

      // put a response into memory.
      signalConsumerSync(
        "success",
        "code for: " + msg.file,
        controlArray,
        dataArray,
        () => 0 /* fail to notify */
      );
    },
    wait: (arr, index, value) => {
      if (arr[index] === value) {
        throw err("synthetic post should have changed sleep_bit");
      } else {
        return "not-equal";
      }
    },
  });
};
