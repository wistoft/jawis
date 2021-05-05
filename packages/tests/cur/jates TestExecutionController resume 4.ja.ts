import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

// resume when pausing-newTests

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();
  tec.setTestList(["more1.test"]);
  tec.resume();

  return tec.lc.waiter.await("done");
};
