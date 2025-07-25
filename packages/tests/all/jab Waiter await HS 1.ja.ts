import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// soft timeout and hard timeout

//resolve before soft timeout

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  setTimeout(() => {
    waiter.set("done");
  }, 20);

  return waiter.await("done", 200, 100);
};
