import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// cancel

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  const prom = waiter.await("done");
  waiter.noisyCancel();

  return prom;
};
