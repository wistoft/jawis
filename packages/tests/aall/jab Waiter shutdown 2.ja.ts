import { TestProvision } from "^jarun";

import { getWaiter_in_stopping_state } from "../_fixture";

// shutdown while stopping is okay.

export default (prov: TestProvision) => {
  const [waiter, shutdownProm] = getWaiter_in_stopping_state(prov);

  const p2 = waiter.shutdown(() => {
    prov.imp("never called");
  });

  return [shutdownProm, p2];
};
