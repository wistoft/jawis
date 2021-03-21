import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// normal noisy kill.

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  return waiter.killReal({
    kill: () => {
      prov.eq("starting", waiter.getState()); //kill is call sync, and state isn't set to stopping yet.
      waiter.set("done");
    },
    noisyName: "Something",
  });
};
