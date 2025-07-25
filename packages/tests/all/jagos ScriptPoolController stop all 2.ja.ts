import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";
import { AbsoluteFile } from "^jabc";

//ensure stopped, when a lot have run.

export default async (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  await pool.restartAllScripts();

  await pool.stopAllScripts();

  prov.imp(pool.getScriptStatus());

  await pool.shutdown();
};
