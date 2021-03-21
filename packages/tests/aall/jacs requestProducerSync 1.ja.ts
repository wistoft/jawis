import { TestProvision } from "^jarun";

import { requestProducerSync_test } from "../_fixture";

// compile was successful

export default (prov: TestProvision) => {
  requestProducerSync_test(prov);
};
