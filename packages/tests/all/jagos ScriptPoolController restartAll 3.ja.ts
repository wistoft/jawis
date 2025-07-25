import { TestProvision } from "^jarun";

import {
  getJabScriptPoolController_many,
  waitForAllStoppedOrListening,
} from "../_fixture";

//shutdown, when scripts (probably) have stopped itself.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_many(prov);

  return pool
    .restartAllScripts()
    .then(() => waitForAllStoppedOrListening(pool))
    .then(() => pool.shutdown());
};
