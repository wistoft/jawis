import { TestProvision } from "^jarun";

import { getJabScriptPoolController } from "../_fixture";
import { sleeping } from "^jab";

//stop all scripts, when script (probably) have stopped.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController(prov);

  return pool
    .restartAllScripts()
    .then(() => {
      //to allow the script to run.
      return sleeping(100);
    })
    .then(() => {
      return pool.ensureAllScriptsStopped().then(pool.shutdown);
    });
};
