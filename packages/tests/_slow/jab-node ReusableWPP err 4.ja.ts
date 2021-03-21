import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps } from "../_fixture";

//shutdown, before process has returned.

export default (prov: TestProvision) => {
  const [angel, deps] = getReusableWPPAndDeps(prov);

  const p1 = angel.useProcess(deps);

  return angel
    .shutdown()
    .finally(() => p1.then((process) => process.shutdown()))
    .finally(() => angel.shutdown()); //successful shutdown of angel
};
//
