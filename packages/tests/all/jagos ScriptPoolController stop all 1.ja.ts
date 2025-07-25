import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

// ensure stopped, when nothing is started. Easy.

export default async (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  await pool.stopAllScripts();

  prov.imp(pool.getScriptStatus());

  await pool.shutdown();
};
