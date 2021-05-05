import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

//resume when unstarted

export default (prov: TestProvision) => {
  const lc = littleLoop(prov, false);

  lc.resume();

  return lc.getPromise();
};
