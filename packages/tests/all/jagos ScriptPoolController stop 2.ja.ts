import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

// ensure stopped, when script has stopped itself.

export default async (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  await pool.restartBee("hello.bee");

  prov.eq("stopped", pool.getSingleScriptStatus("hello.bee"));

  await pool.stopScript("ready.bee");

  await pool.shutdown();
};
