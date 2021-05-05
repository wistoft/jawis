import { sleeping } from "^jab";
import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

// prepend tests when idle.

export default async (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  await tec.lc.waiter.await("done");

  tec.prependTestList(["more1.test"]);

  return tec.lc.waiter.await("done");
};
