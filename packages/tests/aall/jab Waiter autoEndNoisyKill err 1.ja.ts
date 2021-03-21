import { TestProvision } from "^jarun";

import { getWaiter_waiting } from "../_fixture";

// autoEndKill when waiting

export default (prov: TestProvision) => {
  const [waiter, prom] = getWaiter_waiting(prov);

  waiter.killReal({ kill: () => {}, autoEnd: true, noisyName: "Something" });

  return prom;
};
