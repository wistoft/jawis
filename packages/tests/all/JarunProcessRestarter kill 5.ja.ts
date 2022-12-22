import { TestProvision } from "^jarun";

import { TS_TIMEOUT } from "^jab-node";
import { getProcessRestarter_running } from "../_fixture";

//kill after restart (async)

export default (prov: TestProvision) =>
  getProcessRestarter_running(prov).then((jpr) => {
    jpr.restart();

    return jpr.waiter.await("running", TS_TIMEOUT).finally(jpr.kill);
  });
