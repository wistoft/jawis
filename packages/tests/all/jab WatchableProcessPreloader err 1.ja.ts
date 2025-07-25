import { TestProvision } from "^jarun";

import { getJabWatchableProcessPreloaderAndDeps } from "../_fixture";

//double use.

export default (prov: TestProvision) => {
  const [wpp, deps] = getJabWatchableProcessPreloaderAndDeps(prov);

  return wpp.useBee(deps).then(
    (bee) =>
      wpp
        .useBee(deps) // use again
        .finally(bee.shutdown) //just to clean up
  );
};
