import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

//resume when pausing

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();
  tec.resume();

  return tec.waiter.await("exec-done");
};
