import { TestProvision } from "^jarun";

import { getJabScriptPoolController_one } from "../_fixture";

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov);

  return pool.shutdown();
};
