import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

// pause when pausing-newTests

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();
  tec.setTestList(["more1.test"]);
  tec.pause();

  return tec.lc.waiter.await("paused").then(() => {
    prov.log("TestFramework", "resuming");
    tec.resume();

    return tec.lc.waiter.await("done");
  });
};
