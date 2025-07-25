import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

// ensure stopped, when script is running.

export default async (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  await pool.restartBee("ready.bee");

  await pool.stopScript("ready.bee");

  prov.eq("stopped", pool.getSingleScriptStatus("ready.bee"));

  await pool.shutdown();
};
