import { TestProvision } from "^jarun";

import { getNodeWs, getServer_test_app } from "../_fixture";

// doesn't close nodeWs, but server will close connections.

export default (prov: TestProvision) =>
  getServer_test_app(prov).then((server) =>
    getNodeWs(prov)
      .finally(() => server.shutdown())
      .then(() => {
        // to avoid return
      })
  );
