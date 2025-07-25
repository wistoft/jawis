import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// only soft timeout

// reject after soft timeout

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  setTimeout(() => {
    waiter.onError(new Error("Only little late."));
  }, 20);

  return waiter.await("done", 0, 1);
};
