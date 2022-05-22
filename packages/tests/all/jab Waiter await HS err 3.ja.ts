import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// soft timeout and hard timeout

// reject after soft timeout

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  setTimeout(() => {
    waiter.onError(new Error("Sorry"));
  }, 20);

  return waiter.await("done", 100, 1);
};
