import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// event when awaiting

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  const prom = waiter.await("first");

  waiter.event("first");

  return prom;
};
