import { TestProvision } from "^jarun";
import { filterScriptStatuses } from "^tests/_fixture/testFixtures/jagos";

import { getFixturePath, getJabScriptPoolController_one } from "../_fixture";

//folder is read at init

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov, {
    scriptFolders: [getFixturePath("tsProject")],
  });

  prov.imp(filterScriptStatuses(pool.getScriptStatus()));

  return pool.shutdown();
};
