import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps } from "../_fixture";

//kill, before process has returned.

export default (prov: TestProvision) => {
  const [angel, deps] = getReusableWPPAndDeps(prov);

  const p1 = angel.useProcess(deps);
  const p2 = angel.noisyKill();

  return [p1, p2];
};
