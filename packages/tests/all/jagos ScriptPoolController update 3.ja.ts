import { TestProvision } from "^jarun";

import {
  emptyScratchFolder,
  getJabScriptPoolController_one,
} from "../_fixture";

//stopped explicitly defined scripts, are not affected by script folder update.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov, {
    scriptFolders: [emptyScratchFolder()],
  });

  pool.updateScripts();

  prov.imp(pool.getScriptStatus());

  return pool.shutdown();
};
