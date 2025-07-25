import { TestProvision } from "^jarun";

import { getJabWatchableProcessPreloaderAndDeps } from "../_fixture";

// kill in the middle of use process.

export default (prov: TestProvision) => {
  const [wpp, deps] = getJabWatchableProcessPreloaderAndDeps(prov);

  const p = wpp.useBee(deps);

  //this is ignored, because it's already in use.
  wpp.shutdown();

  return p.then((proc) => proc.shutdown());
};
