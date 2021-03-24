import { TestProvision } from "^jarun";

import { getInMemoryBee } from "../_fixture";

// bee is not returned.

export default (prov: TestProvision) => {
  getInMemoryBee(prov);
};
