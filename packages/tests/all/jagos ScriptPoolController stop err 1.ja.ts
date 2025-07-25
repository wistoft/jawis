import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";
import { AbsoluteFile } from "^jabc";

//by default scripts are killed
// so it doesn't matter it's not responding to shutdown.

export default async (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov, {
    scripts: [{ script: "unstoppable.bee" as AbsoluteFile }],
  });

  await pool.restartBee("unstoppable.bee");

  await pool.killScript("unstoppable.bee");

  prov.eq("stopped", pool.getSingleScriptStatus("unstoppable.bee"));

  await pool.shutdown();
};
