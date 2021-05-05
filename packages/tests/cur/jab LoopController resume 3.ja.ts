import { TestProvision } from "^jarun";

import { emptyLoop } from "../_fixture";

// sync resume when no iterations

export default (prov: TestProvision) => {
  const lc = emptyLoop(prov);

  lc.resume();

  return lc.getPromise();
};
