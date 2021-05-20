import { TestProvision } from "^jarun";
import { sleeping } from "^jab";

import {
  getJabScriptPoolController_one,
  getScriptPath,
  mapScriptFilesToDefault,
} from "../_fixture";

//stop all scripts, when script is ipc

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov, {
    scriptsDefs: mapScriptFilesToDefault([getScriptPath("beeSendAndWait.js")]),
  });

  return pool
    .restartAllScripts()
    .then(() => sleeping(100)) //to allow the script to run.
    .then(pool.ensureAllScriptsStopped)
    .then(pool.shutdown);
};
