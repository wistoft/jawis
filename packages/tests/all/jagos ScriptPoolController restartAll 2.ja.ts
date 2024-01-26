import { TestProvision } from "^jarun";

import {
  getJabScriptPoolController_one,
  getScriptPath,
  shutdownQuickFix,
  mapScriptFilesToDefault,
  waitForAllStoppedOrListening,
} from "../_fixture";

//shutdown, when script is ipc.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov, {
    scriptsDefs: mapScriptFilesToDefault([getScriptPath("beeSendAndWait.js")]),
  });

  return pool
    .restartAllScripts()
    .then(() => waitForAllStoppedOrListening(pool))
    .then(() => shutdownQuickFix(pool));
};
