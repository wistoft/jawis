import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// after timeout cancel is a noop, because the waiter threw.

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  return waiter.await("done", 1).catch(() => {
    waiter.cancel();
  });
};
