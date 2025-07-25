import { TestProvision } from "^jarun";
import { filterScriptStatuses } from "^tests/_fixture";

import {
  emptyScratchFolder,
  getJabScriptPoolController_one,
  getScriptPath,
} from "../_fixture";

//running explicitly-defined scripts, are not affected by script folder update.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov, {
    scriptFolders: [emptyScratchFolder()],
  });

  return pool.restartBee(getScriptPath("hello.js")).then(() => {
    pool.updateScripts();

    prov.imp(filterScriptStatuses(pool.getScriptStatus()));

    return pool.shutdown();
  });
};
