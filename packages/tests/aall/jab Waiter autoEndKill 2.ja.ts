import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// autoEndKill in end-state

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);
  waiter.set("done");

  return waiter.killReal({ kill: () => {}, autoEnd: true });
};
