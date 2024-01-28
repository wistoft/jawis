import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// set state when awaiting for other state

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  const prom = waiter.await("done", 1);

  waiter.set("ready"); //has no effect

  return prom; //should timeout
};
