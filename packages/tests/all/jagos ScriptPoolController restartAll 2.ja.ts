import { TestProvision } from "^jarun";

import {
  getJabScriptPoolController_one,
  getScriptPath,
  mapScriptFilesToDefault,
  waitForAllStoppedOrListening,
} from "../_fixture";

//shutdown, when script is ipc.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov, {
    scripts: mapScriptFilesToDefault([getScriptPath("beeSendAndWait.js")]),
  });

  return pool
    .restartAllScripts()
    .then(() => waitForAllStoppedOrListening(pool))
    .then(() => pool.shutdown());
};
