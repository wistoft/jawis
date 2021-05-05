import { TestProvision } from "^jarun";

import { getTestExecutionController_running } from "../_fixture";

// prepend tests when pausing.

export default async (prov: TestProvision) => {
  const tec = getTestExecutionController_running(prov);

  tec.pause();
  tec.prependTestList(["more1.test"]);

  await tec.lc.waiter.await("done");
};
