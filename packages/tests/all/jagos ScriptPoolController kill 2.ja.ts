import { TestProvision } from "^jarun";

import { getJabScriptPoolController } from "../_fixture";

export default (prov: TestProvision) => {
  const pool = getJabScriptPoolController(prov);

  return pool.noisyKill();
};
