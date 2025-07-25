import { TestProvision } from "^jarun";

import { getNodeWs, getServer_test_app } from "../_fixture";

export default (prov: TestProvision) =>
  getServer_test_app(prov).then((server) =>
    getNodeWs(prov).then((nws) => {
      nws.send({ type: "dummy" });

      return nws.waiter
        .await("data")
        .then(prov.imp)
        .finally(nws.shutdown)
        .finally(server.shutdown);
    })
  );
