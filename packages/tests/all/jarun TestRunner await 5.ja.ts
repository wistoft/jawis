import { getPromise, sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

// await after test has ended is rude.

export default (prov: TestProvision) => {
  const prom = getPromise<void>();

  jtrRunTest(prov, () => (inner) => {
    sleeping(10)
      .then(() => {
        inner.await(Promise.resolve());
      })
      .catch(prov.onError)
      .finally(prom.resolve);
  });

  return prom.promise;
};
