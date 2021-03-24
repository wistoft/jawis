import { TestProvision } from "^jarun";

import { getNodeWs } from "../_fixture";

// host invalid

export default (prov: TestProvision) => {
  getNodeWs(prov, "", { host: "" });
};
