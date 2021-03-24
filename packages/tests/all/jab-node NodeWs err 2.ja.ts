import { TestProvision } from "^jarun";

import { getNodeWs, getServer_test_app } from "../_fixture";

// doesn't close nodeWs or server
export default (prov: TestProvision) =>
  getServer_test_app(prov).then(() =>
    getNodeWs(prov).then(() => {
      // to avoid return
    })
  );
