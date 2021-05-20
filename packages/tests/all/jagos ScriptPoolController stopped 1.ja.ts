import { TestProvision } from "^jarun";

import { getJabScriptPoolController_one } from "../_fixture";

// ensure stopped, when nothing is started. Easy.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController_one(prov);

  return pool.ensureAllScriptsStopped().then(pool.shutdown);
};
