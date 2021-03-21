import { TestProvision } from "^jarun";
import { requestProducerSync_test } from "../_fixture";

// consumer timeout, when producer hasn't started anything

export default (prov: TestProvision) => {
  requestProducerSync_test(prov, {
    wait: () => "timed-out",
  });
};
