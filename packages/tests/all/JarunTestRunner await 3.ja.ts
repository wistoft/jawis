import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { jtrRunTest, youWaitedForMe } from "../_fixture";

// await after the sync part the test case has finished.

export default (prov: TestProvision) =>
  jtrRunTest(
    prov,
    () => (inner) =>
      sleeping(10).then(() => {
        inner.await(youWaitedForMe(inner));
      })
  );
