import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

//start a lot

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  return pool.restartAllScripts().then(pool.shutdown);
};
