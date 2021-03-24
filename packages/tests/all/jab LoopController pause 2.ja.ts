import { TestProvision } from "^jarun";

import { infiniteLoop } from "../_fixture";

//pause after first iteration

export default (prov: TestProvision) => {
  const lc = infiniteLoop(prov);

  return lc.waiter.await("iteration-done").then(() => lc.pause());
};
