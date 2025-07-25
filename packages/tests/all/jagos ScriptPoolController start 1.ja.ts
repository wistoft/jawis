import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

//start single script

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  return pool.restartBee("hello.bee").then(pool.shutdown);
};
