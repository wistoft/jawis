import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

// ensure stopped, when script needs graceful shutdown

export default async (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  await pool.restartBee("graceful.bee");

  await pool.stopScript("graceful.bee");

  prov.eq("stopped", pool.getSingleScriptStatus("graceful.bee"));

  await pool.shutdown();
};
