import { TestProvision } from "^jarun";
import { err } from "^jab";
import {
  CaIndex,
  getControlArray,
  setCompiling,
  ConsumerStates,
  signalConsumerSync,
} from "^jacs/protocol";
import { requestProducerSync_test } from "../_fixture";

// consumer timeout, when producer is compiling.

export default (prov: TestProvision) => {
  const controlArray = getControlArray();
  const dataArray = new Uint8Array(new SharedArrayBuffer(1000));

  prov.catch(() =>
    requestProducerSync_test(prov, {
      controlArray,
      dataArray,
      wait: () => {
        setCompiling(controlArray);

        return "timed-out";
      },
      noSoftTimeout: true,
    })
  );

  const state = controlArray[CaIndex.consumer_state] as ConsumerStates; // prettier-ignore

  prov.eq(ConsumerStates.timed_out, state);

  //
  // now producer has result
  //

  prov.catch(() =>
    signalConsumerSync("success", "the data", controlArray, dataArray, () =>
      err("unreach")
    )
  );
};
