import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// shutdown normally

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  return waiter.shutdown(() => {
    waiter.set("done");
  });
};
