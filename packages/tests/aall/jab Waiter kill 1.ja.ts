import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// kill normally

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  return waiter.killReal({
    kill: () => {
      waiter.set("done");
    },
  });
};
