import { TestProvision } from "^jarun";

import { getJabScriptPoolController_one } from "../_fixture";
import { sleeping } from "^yapu";

//shutdown, when script (probably) have stopped itself.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov);

  return pool
    .restartAllScripts()
    .then(() => sleeping(100)) //to allow the script to run.
    .then(pool.shutdown);
};
