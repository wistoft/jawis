import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

// new tests when running.

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.setTestList(["more1.test"]);

  return tec.lc.waiter.await("done");
};
