import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

// prepend tests when paused.

export default async (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();

  await tec.lc.waiter.await("paused");

  tec.prependTestList(["more1.test"]);

  await tec.lc.waiter.await("done");
};
