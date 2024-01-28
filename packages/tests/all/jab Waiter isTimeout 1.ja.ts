import { TestProvision } from "^jarun";
import { Waiter } from "^state-waiter";

import { getWaiter } from "../_fixture";

// errors throwns at timeout are marked.

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  return waiter.await("done", 1).catch((error) => {
    prov.imp("is timeout:", Waiter.isTimeout(error));
  });
};
