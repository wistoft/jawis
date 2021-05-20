import { TestProvision } from "^jarun";

import { getJabScriptPoolController_one } from "../_fixture";

//start unknown script

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov);

  return pool.restartScript("dontExist.js").finally(pool.shutdown);
};
