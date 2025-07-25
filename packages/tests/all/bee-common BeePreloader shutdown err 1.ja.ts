import { TestProvision } from "^jarun";

import { getJabBeePreloader, filterUhPromise } from "../_fixture";

//shutdown correctly, but doesn't wait for exit.

export default (prov: TestProvision) => {
  filterUhPromise(prov);
  getJabBeePreloader(prov).shutdown();
};
