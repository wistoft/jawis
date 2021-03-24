import { TestProvision } from "^jarun";

import { getTestExecutionController } from "../_fixture";

// test framework throws

export default (prov: TestProvision) => {
  const tec = getTestExecutionController(prov);

  tec.setTestList(["throws.test"]);

  return tec.waiter.await("idle");
};
