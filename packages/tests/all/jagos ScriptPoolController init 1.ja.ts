import { TestProvision } from "^jarun";

import { getFixturePath, getJabScriptPoolController_one } from "../_fixture";

//folder is read at init

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov, {
    scriptFolders: [getFixturePath("tsProject")],
  });

  prov.imp(pool.getScriptStatus());

  return pool.shutdown();
};
