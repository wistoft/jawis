import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { jtrRunTest, youWaitedForMe } from "../_fixture";

// await in await phase (i.e. after return has resolved)

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    inner.await(
      sleeping(10).then(() => {
        inner.await(youWaitedForMe(inner));
      })
    );
  });
