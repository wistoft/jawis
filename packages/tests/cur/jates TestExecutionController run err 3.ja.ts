import { TestProvision } from "^jarun";

import { sleeping } from "^jab";

import { getTestExecutionController } from "../_fixture";

// test framework resolves late

export default (prov: TestProvision) => {
  const tec = getTestExecutionController(prov);

  tec.setTestList(["late.resolve.test"]);

  return tec.lc.waiter.await("done").then(() => sleeping(200));
};
