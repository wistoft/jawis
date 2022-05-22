import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// after timeout it's possible to await again right away.

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov);

  //after done timeouts out, ready is registered, and it times out.

  return waiter.await("done", 1).catch(() => waiter.await("ready", 1));
};
