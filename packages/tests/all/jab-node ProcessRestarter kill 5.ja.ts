import { TestProvision } from "^jarun";

import { getProcessRestarter_running } from "../_fixture";

//kill after restart (async)

export default (prov: TestProvision) =>
  getProcessRestarter_running(prov).then((jpr) => {
    jpr.restart();

    return jpr.waiter.await("running").finally(jpr.kill);
  });
