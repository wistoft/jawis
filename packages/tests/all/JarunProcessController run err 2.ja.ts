import { TestProvision } from "^jarun";

import { getJarunProcessController, getRunTestArgs } from "../_fixture";

// run test after shutdown.

export default (prov: TestProvision) => {
  const jarun = getJarunProcessController(prov);

  return jarun
    .kill()
    .then(() => jarun.runTest(...getRunTestArgs("first test.ja.ts")));
};
