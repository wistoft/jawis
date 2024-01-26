import { TestProvision } from "^jarun";

import {
  getJabScriptPoolController_one,
  waitForAllStoppedOrListening,
} from "../_fixture";

//shutdown, when script (probably) have stopped itself.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov);

  return pool
    .restartAllScripts()
    .then(() => waitForAllStoppedOrListening(pool))
    .then(pool.shutdown);
};
