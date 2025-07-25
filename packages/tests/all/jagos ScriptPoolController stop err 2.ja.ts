import { AbsoluteFile } from "^jab";
import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

//bee doesn't response to shutdown.
// but graceful shutdown reverts to kill

export default async (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov, {
    scripts: [
      { script: "unstoppable.bee" as AbsoluteFile, shutdownTimeout: 100 },
    ],
  });

  await pool.restartBee("unstoppable.bee");

  await pool.killScript("unstoppable.bee");

  prov.eq("stopped", pool.getSingleScriptStatus("unstoppable.bee"));

  await pool.shutdown();
};
