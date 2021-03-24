import { TestProvision } from "^jarun";

import { getNodeWs_starting } from "../_fixture";

// doesn't shutdown a socket in starting state.

export default (prov: TestProvision) => {
  getNodeWs_starting(prov);
};
