import { prej } from "^jab";
import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// kill rejects

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  return waiter.killReal({ kill: () => prej("I wont slice") }).finally(() => {
    prov.chk(waiter.is("stopping"));
    prov.imp("dead");
  });
};
