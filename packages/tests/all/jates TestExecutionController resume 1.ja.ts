import { TestProvision } from "^jarun";

import { getTestExecutionController_paused } from "../_fixture";

//resume when paused

export default (prov: TestProvision) =>
  getTestExecutionController_paused(prov).then((tec) => {
    tec.resume();

    return tec.waiter.await("exec-done");
  });
