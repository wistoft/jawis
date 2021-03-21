import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";
import { sleeping } from "^jab";

//using prov after test ends. (in setTimeout)

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    setTimeout(() => inner.imp("arrr"), 10);
  }).then(() => sleeping(20));
