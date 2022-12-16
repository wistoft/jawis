import { TestProvision } from "^jarun";

import { getNodeWs, getServer_test_app } from "../_fixture";

export default (prov: TestProvision) =>
  getServer_test_app(prov).then((server) =>
    getNodeWs(prov).then((nws) =>
      nws
        .send({ type: "dummy" })
        .then(() => nws.waiter.await("data"))
        .then((data: any) => {
          prov.imp(data);
        })
        .finally(() => {
          return nws.shutdown();
        })
        .finally(() => {
          return server.shutdown();
        })
    )
  );
