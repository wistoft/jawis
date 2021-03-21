import { TestProvision } from "^jarun";

import { getServer_test_app, testHttpRequest } from "../_fixture";

export default (prov: TestProvision) =>
  getServer_test_app(prov).then((server) =>
    testHttpRequest()
      .then((data) => {
        prov.imp(data);
      })
      .finally(() => server.shutdown())
  );
