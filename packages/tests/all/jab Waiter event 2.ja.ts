import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// event when awaiting for other event

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  const prom = waiter.await("first", 1);

  waiter.event("second"); //has no effect

  return prom; //should timeout
};
