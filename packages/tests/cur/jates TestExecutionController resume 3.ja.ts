import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

//resume when running

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.resume();

  return tec.lc.waiter.await("done");
};
