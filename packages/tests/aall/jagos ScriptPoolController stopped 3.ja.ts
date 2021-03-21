import { TestProvision } from "^jarun";
import { sleeping } from "^jab";
import { mapScriptFilesToDefault } from "^jagos";

import { getJabScriptPoolController, getScriptPath } from "../_fixture";

//stop all scripts, when script is ipc

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController(prov, "", {
    scriptsDefs: mapScriptFilesToDefault([getScriptPath("beeSendAndWait.js")]),
  });

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
