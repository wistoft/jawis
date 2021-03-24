import { TestProvision } from "^jarun";

import { getServer_test_app } from "../_fixture";

export default (prov: TestProvision) =>
  getServer_test_app(prov).then((server) => server.shutdown());
