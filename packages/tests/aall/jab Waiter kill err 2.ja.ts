import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// kill throws sync

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  return waiter
    .killReal({
      kill: () => {
        throw new Error("I wont dice");
      },
    })
    .finally(() => {
      prov.imp("dead");
    });
};
