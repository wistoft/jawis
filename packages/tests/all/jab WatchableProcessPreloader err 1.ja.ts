import { TestProvision } from "^jarun";

import {
  getJabWatchableProcessPreloaderAndDeps,
  getProcessDepsThatMustNotBeUsed,
} from "../_fixture";

//double use.

export default (prov: TestProvision) => {
  const [wpp, deps] = getJabWatchableProcessPreloaderAndDeps(prov);

  return wpp.useProcess(deps).then(
    (process) =>
      wpp
        .useProcess(getProcessDepsThatMustNotBeUsed()) // use again
        .finally(() => process.shutdown()) //just to clean up
  );
};
