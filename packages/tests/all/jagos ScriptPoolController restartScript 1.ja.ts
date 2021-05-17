import { TestProvision } from "^jarun";

import { getJabScriptPoolController, getScriptPath } from "../_fixture";
import { sleeping } from "^jab";

//start single script

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController(prov);

  return pool
    .restartScript(getScriptPath("hello.js"))
    .then(() => sleeping(100)) //to allow the script to run.
    .then(pool.shutdown);
};
