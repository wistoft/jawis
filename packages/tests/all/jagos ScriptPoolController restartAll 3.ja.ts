import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { getJabScriptPoolController_many } from "../_fixture";

//shutdown, when scripts (probably) have stopped itself.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_many(prov);

  return pool
    .restartAllScripts()
    .then(() => {
      return sleeping(100); //to allow the scripts to run.
    })
    .then(pool.shutdown);
};
