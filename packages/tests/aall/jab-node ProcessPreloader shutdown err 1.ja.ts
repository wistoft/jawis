import { TestProvision } from "^jarun";

import { getJabProcessPreloader, filterUhPromise } from "../_fixture";

//shutdown correctly, but doesn't wait for exit.

export default (prov: TestProvision) => {
  filterUhPromise(prov);
  getJabProcessPreloader(prov).shutdown();
};
