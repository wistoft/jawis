import { TestProvision } from "^jarun";

import { getJabScriptPoolController_new } from "../_fixture";

//restart bee that is running.

export default async (prov: TestProvision) => {
  const pool = getJabScriptPoolController_new(prov);

  await pool.restartBee("ready.bee");

  prov.eq("running", pool.getSingleScriptStatus("ready.bee"));

  //now restart it

  await pool.restartBee("ready.bee");

  await pool.shutdown();
};
