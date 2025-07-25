import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// only soft timeout

//reject before soft timeout

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  setTimeout(() => {
    waiter.onError(new Error("Sorry"));
  }, 20);

  return waiter.await("done", 0, 100);
};
