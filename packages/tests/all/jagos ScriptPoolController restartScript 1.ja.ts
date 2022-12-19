import { TestProvision } from "^jarun";

import { getJabScriptPoolController_one, getScriptPath } from "../_fixture";
import { sleeping } from "^yapu";

//start single script

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov);

  return pool
    .restartScript(getScriptPath("hello.js"))
    .then(() => sleeping(100)) //to allow the script to run.
    .then(pool.shutdown);
};
