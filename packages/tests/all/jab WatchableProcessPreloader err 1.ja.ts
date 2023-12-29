import { TestProvision } from "^jarun";

import {
  getJabWatchableProcessPreloaderAndDeps,
  getProcessDepsThatMustNotBeUsed,
  shutdownQuickFix,
} from "../_fixture";

//double use.

export default (prov: TestProvision) => {
  const [wpp, deps] = getJabWatchableProcessPreloaderAndDeps(prov);

  return wpp.useProcess(deps).then(
    (process) =>
      wpp
        .useProcess(getProcessDepsThatMustNotBeUsed()) // use again
        .finally(() => shutdownQuickFix(process)) //just to clean up
  );
};
