import { TestProvision } from "^jarun";
import { ServerWaiter } from "^jab-express";

import { getServerDeps_test_app } from "../_fixture";

// server is killed, before it fires listening event.

export default (prov: TestProvision) => {
  const server = new ServerWaiter(getServerDeps_test_app(prov));

  const p2 = server.waitForListening();

  const p1 = server.killIfRunning();

  return [p1, p2];
};
