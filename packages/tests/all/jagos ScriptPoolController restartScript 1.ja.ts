import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { getJabScriptPoolController_one, getScriptPath } from "../_fixture";

//start single script

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov);

  return pool
    .restartScript(getScriptPath("hello.js"))
    .then(() => sleeping(100)) //to allow the script to run.
    .then(pool.shutdown);
};
