import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

//start unknown script

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  return pool.restartBee("dontExist.js").finally(pool.shutdown);
};
