import { TestProvision } from "^jarun";

import {
  getJabScriptPoolController_one,
  getScriptPath,
  mapScriptFilesToDefault,
} from "../_fixture";
import { sleeping } from "^yapu";

//shutdown, when script is ipc.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov, {
    scriptsDefs: mapScriptFilesToDefault([getScriptPath("beeSendAndWait.js")]),
  });

  return pool
    .restartAllScripts()
    .then(() => sleeping(100)) //to allow the script to run.
    .then(pool.shutdown);
};
