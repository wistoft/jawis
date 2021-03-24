import { TestProvision } from "^jarun";

import { getNodeWs, getServer_test_app } from "../_fixture";

// doesn't close server. But nodeWs shutdowns alright.

export default (prov: TestProvision) =>
  getServer_test_app(prov).then(() =>
    getNodeWs(prov).then((nws) => nws.shutdown())
  );
