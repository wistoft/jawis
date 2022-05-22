import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// soft timeout and hard timeout

// resolve after hard timeout

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  return waiter.await("done", 20, 1).finally(() => {
    waiter.set("done");
  });
};
