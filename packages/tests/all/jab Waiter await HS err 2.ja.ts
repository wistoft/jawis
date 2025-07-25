import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// soft timeout and hard timeout

// resolve after soft timeout

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  setTimeout(() => {
    waiter.set("done");
  }, 20);

  return waiter.await("done", 100, 1);
};
