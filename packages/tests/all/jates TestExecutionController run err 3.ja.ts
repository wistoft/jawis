import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";

import { getTestExecutionController } from "../_fixture";

// test framework resolves late

export default (prov: TestProvision) => {
  const tec = getTestExecutionController(prov);

  tec.setTestList(["late.resolve.test"]);

  return tec.lc.waiter.await("paused").then(() => sleeping(200));
};
