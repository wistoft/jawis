import { TestProvision } from "^jarun";

import { getJabWatchableProcessPreloaderAndDeps } from "../_fixture";

// kill before use process.

export default (prov: TestProvision) => {
  getJabWatchableProcessPreloaderAndDeps(prov);
};
