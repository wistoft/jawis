import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// soft timeout and hard timeout

// reject after hard timeout

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  return waiter.await("done", 20, 1).catch((error) => {
    prov.onError(error);
    waiter.onError(new Error("Sorry"));
  });
};
