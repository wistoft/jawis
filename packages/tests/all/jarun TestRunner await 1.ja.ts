import { TestProvision } from "^jarun";

import { jtrRunTest, youWaitedForMe } from "../_fixture";

//await resolving promise

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    inner.await(youWaitedForMe(inner));
  });
