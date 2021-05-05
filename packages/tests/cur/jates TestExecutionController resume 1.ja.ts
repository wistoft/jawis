import { TestProvision } from "^jarun";
import { getTestExecutionController_running } from "^tests/_fixture";

//resume when paused

export default (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();

  return tec.lc.waiter.await("paused").then(() => {
    tec.resume();

    return tec.lc.waiter.await("done");
  });
};
