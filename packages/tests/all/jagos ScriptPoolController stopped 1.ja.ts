import { TestProvision } from "^jarun";

import { getJabScriptPoolController } from "../_fixture";

// ensure stopped, when nothing is started. Easy.

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController(prov);

  return pool.ensureAllScriptsStopped().then(pool.shutdown);
};
