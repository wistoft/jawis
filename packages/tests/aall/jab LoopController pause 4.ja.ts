import { TestProvision } from "^jarun";

import { infiniteLoop } from "../_fixture";

//pause when unstarted

export default (prov: TestProvision) => {
  const lc = infiniteLoop(prov, false);

  lc.pause();

  return lc.waiter.getState();
};
