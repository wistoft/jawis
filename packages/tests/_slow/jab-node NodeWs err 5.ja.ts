import { TestProvision } from "^jarun";

import { getNodeWs_starting } from "../_fixture";

// there is no server.

export default (prov: TestProvision) => {
  const nws = getNodeWs_starting(prov, "", { host: "blublu" });

  //need a very high timeout, to resolve the hostname
  return nws.waiter.await("running", 3000);
};
