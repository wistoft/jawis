import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// kill doesn't set done.

export default (prov: TestProvision) =>
  getWaiter(prov).killReal({ kill: () => {} });
