import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps, shutdownQuickFix } from "../_fixture";

//double use, before the old has returned is not allowed.

export default (prov: TestProvision) => {
  const [angel, deps] = getReusableWPPAndDeps(prov);

  const p1 = angel.useProcess(deps).then((process) => shutdownQuickFix(process)); // prettier-ignore
  const p2 = angel.useProcess(deps).catch((error: unknown) => {
    prov.onError(error);
  });

  return Promise.allSettled([p1, p2]).finally(() => shutdownQuickFix(angel));
};
