import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

//pause while running (and pausing)

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();
  tec.pause();

  return tec.waiter.await("paused");
};
