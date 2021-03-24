import { TestProvision } from "^jarun";

import { getNodeWs, getServer_test_app } from "../_fixture";

// doesn't close nodeWs or server.
// A little strange, because server did close.
export default (prov: TestProvision) =>
  getServer_test_app(prov).then(() =>
    getNodeWs(prov).then((nws) => nws.waiter.await("stopped"))
  );
