import { TestProvision } from "^jarun";

import { getJabScriptPoolController } from "../_fixture";
import { sleeping } from "^jab";

//shutdown, when script (probably) have stopped itself.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController(prov);

  return pool
    .restartAllScripts()
    .then(() => {
      return sleeping(100); //to allow the script to run.
    })
    .then(pool.shutdown);
};
