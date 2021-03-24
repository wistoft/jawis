import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// cancel with custom message

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  const prom = waiter.await("done");
  waiter.cancel("You're finished");

  return prom;
};
