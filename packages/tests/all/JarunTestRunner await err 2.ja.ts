import { err, sleeping } from "^jab";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//throw in await promise

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    inner.await(
      sleeping(10).then(() => {
        inner.imp("You waited on me :-)");

        err("ups");
      })
    );
  });
