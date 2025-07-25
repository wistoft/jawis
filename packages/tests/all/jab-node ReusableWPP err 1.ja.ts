import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps } from "../_fixture";

//double use, before the old has returned is not allowed.

export default (prov: TestProvision) => {
  const [angel, deps] = getReusableWPPAndDeps(prov);

  const p1 = angel.useBee(deps).then((process) => process.shutdown());
  const p2 = angel.useBee(deps).catch(prov.onError);

  return Promise.allSettled([p1, p2]).finally(() => angel.shutdown());
};
