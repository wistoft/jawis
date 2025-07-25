import { TestProvision } from "^jarun";

import { getJarunProcessController, getRunTestArgs } from "../_fixture";

// run test after shutdown.

export default async (prov: TestProvision) => {
  const jarun = getJarunProcessController(prov);

  await jarun.kill();

  jarun.runTest(...getRunTestArgs("first test.ja.ts"));
};
