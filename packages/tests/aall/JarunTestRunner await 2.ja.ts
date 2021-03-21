import { prej } from "^jab";
import { TestProvision } from "^jarun";

import { jtrRunTest, youWaitedForMe } from "../_fixture";

//wait for all, even if some reject.

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    inner.await(youWaitedForMe(inner));
    inner.await(prej("naughty"));
  });
