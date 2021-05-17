import { TestProvision } from "^jarun";

import { getJabScriptPoolController, getScriptPath } from "../_fixture";
import { sleeping } from "^jab";
import { mapScriptFilesToDefault } from "^jagos";

//shutdown, when script is ipc.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController(prov, "", {
    scriptsDefs: mapScriptFilesToDefault([getScriptPath("beeSendAndWait.js")]),
  });

  return pool
    .restartAllScripts()
    .then(() => sleeping(100)) //to allow the script to run.
    .then(pool.shutdown);
};
