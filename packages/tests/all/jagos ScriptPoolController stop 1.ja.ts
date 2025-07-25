import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

// ensure stopped, when script isn't started.

export default async (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  await pool.stopScript("hello.bee");

  prov.eq("stopped", pool.getSingleScriptStatus("hello.bee"));

  await pool.shutdown();
};
