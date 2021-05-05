import { TestProvision } from "^jarun";

import { getTestExecutionController } from "../_fixture";

// test framework rejects

export default (prov: TestProvision) => {
  const tec = getTestExecutionController(prov);

  tec.setTestList(["rejects.test"]);

  return tec.lc.waiter.await("done");
};
