import { TestProvision } from "^jarun";

import { emptyLoop } from "../_fixture";

// when no iterations, the resume will cause err, because done-state is reach already in sync.

export default (prov: TestProvision) => {
  const lc = emptyLoop(prov);

  lc.resume();

  return lc.getPromise();
};
