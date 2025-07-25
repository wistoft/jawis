import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

//start several script

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  return Promise.all([
    pool.restartBee("dormitory.bee"),
    pool.restartBee("hello.bee"),
    pool.restartBee("angry.bee"),
    pool.restartBee("message.bee"),
    pool.restartBee("ready.bee"),
    pool.restartBee("failing.bee"),
    pool.restartBee("logging.bee"),
  ]).then(pool.shutdown);
};
