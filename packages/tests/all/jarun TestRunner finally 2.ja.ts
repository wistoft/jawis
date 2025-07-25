import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//finally is run after await.

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    inner.finally(() => inner.imp("in finally"));

    inner.await(sleeping(10)).then(() => {
      inner.imp("in await");
    });
  });
