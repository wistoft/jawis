import { err } from "^jab";
import { TestProvision } from "^jarun";

import { jtrRunTest, youWaitedForMe } from "../_fixture";

//throw after registering await.

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    inner.await(youWaitedForMe(inner));

    err("ups");
  });
