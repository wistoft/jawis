import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// await twice.

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  prov.await(waiter.await("done", 1));
  prov.await(waiter.await("done", 1));

  waiter.set("done");
};
