import { TestProvision } from "^jarun";

import { getTestExecutionController } from "../_fixture";

// test framework never resolves the promise

export default (prov: TestProvision) => {
  const tec = getTestExecutionController(prov);

  tec.setTestList(["eternal.test"]);

  return tec.lc.waiter.await("done");
};
