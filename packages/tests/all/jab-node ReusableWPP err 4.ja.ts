import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps, shutdownQuickFix } from "../_fixture";

//shutdown, before process has returned.

export default (prov: TestProvision) => {
  const [angel, deps] = getReusableWPPAndDeps(prov);

  const p1 = angel.useProcess(deps);

  return angel
    .shutdown()
    .finally(() => p1.then((process) => shutdownQuickFix(process)))
    .finally(() => angel.shutdown()); //successful shutdown of angel
};
