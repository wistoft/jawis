import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

// pause when pausing-newTests

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();
  tec.setTestList(["more1.test"]);
  tec.pause();

  return tec.waiter
    .await("paused")
    .then(() => {
      prov.log("TestFramework", "resuming");
      tec.resume();

      return tec.waiter.await("idle");
    })
    .finally(() => {
      prov.imp(tec.waiter.eventTrace);
    });
};
