import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// autoEndKill in starting-state

export default (prov: TestProvision) =>
  getWaiter(prov).killReal({ kill: () => {}, autoEnd: true });
