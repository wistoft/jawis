import { TestProvision } from "^jarun";
import { requestProducerSync_test } from "../_fixture";

// wait returns not-equal, put producer hasn't stored result.

export default (prov: TestProvision) => {
  requestProducerSync_test(prov, {
    wait: () => "not-equal",
  });
};
