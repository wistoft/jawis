import { TestProvision } from "^jarun";

import { getWaiter_stuck_in_stopping_state } from "../_fixture";

// kill while stopping: cancels await-shutdown, and makes the kill normally.

export default (prov: TestProvision) => {
  const [waiter, shutdownProm] = getWaiter_stuck_in_stopping_state(prov);

  const p2 = waiter.killReal({
    kill: () => {
      prov.eq("stopping", waiter.getState());
      waiter.set("done");
    },
    noisyName: "",
  });

  return [shutdownProm, p2];
};
