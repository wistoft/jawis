import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

// await after test has ended is rude.

export default (prov: TestProvision) => {
  jtrRunTest(prov, () => (inner) => {
    sleeping(10)
      .then(() => {
        inner.await(Promise.resolve());
      })
      .catch(prov.onError);
  });

  return sleeping(50);
};
