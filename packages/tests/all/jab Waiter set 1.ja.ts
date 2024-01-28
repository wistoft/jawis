import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// set state when awaiting

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  const prom = waiter.await("done");

  waiter.set("done");

  return prom;
};
