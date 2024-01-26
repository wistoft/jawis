import { TestProvision } from "^jarun";

import {
  getJabScriptPoolController_one,
  waitForAllStoppedOrListening,
} from "../_fixture";

//stop all scripts, when script (probably) have stopped.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov);

  return pool
    .restartAllScripts()
    .then(() => waitForAllStoppedOrListening(pool))
    .then(pool.ensureAllScriptsStopped)
    .then(pool.shutdown);
};
