import { TestProvision } from "^jarun";

import { getWaiter_in_killing_state } from "../_fixture";

// shutdown while killing is okay.

export default (prov: TestProvision) => {
  const [waiter, killProm] = getWaiter_in_killing_state(prov);

  const p2 = waiter.shutdown(() => {
    prov.imp("never called");
  });

  return [killProm, p2];
};
