import { TestProvision } from "^jarun";

import {
  getJabScriptPoolController_one,
  getScriptPath,
  waitForAllStoppedOrListening,
} from "../_fixture";

//start single script

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov);

  return pool
    .restartBee(getScriptPath("hello.js"))
    .then(() => waitForAllStoppedOrListening(pool))
    .then(pool.shutdown);
};
