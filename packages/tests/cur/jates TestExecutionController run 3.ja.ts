import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

// new tests when pausing (and pausing-newTests)

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();
  tec.setTestList(["more1.test"]);
  tec.setTestList(["more2.test"]);

  return tec.lc.waiter.await("done");
};
