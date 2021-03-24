import { TestProvision } from "^jarun";

import { sleeping } from "^jab";

import { getTestExecutionController } from "../_fixture";

// test framework rejects late

export default (prov: TestProvision) => {
  const tec = getTestExecutionController(prov);

  tec.setTestList(["late.reject.test"]);

  return tec.waiter.await("idle").then(() => sleeping(200));
};
