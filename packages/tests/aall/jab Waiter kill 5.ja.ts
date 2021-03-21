import { TestProvision } from "^jarun";

import { getWaiter_stuck_in_stopping_state } from "../_fixture";

// neither shutdown not kill does anything.

export default (prov: TestProvision) => {
  const [waiter, shutdownProm] = getWaiter_stuck_in_stopping_state(prov);

  const p2 = waiter.killReal({
    kill: () => {},
  });

  return [shutdownProm, p2];
};
