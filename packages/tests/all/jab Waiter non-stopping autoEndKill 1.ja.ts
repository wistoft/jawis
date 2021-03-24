import { TestProvision } from "^jarun";

import { getWaiter_non_stopping } from "../_fixture";

// no stopping-state is fine, when kill is sync.

export default (prov: TestProvision) => {
  const waiter = getWaiter_non_stopping(prov);

  return waiter.killReal({ kill: () => {}, autoEnd: true }).then(() => {
    prov.imp(waiter.getState());
  });
};
