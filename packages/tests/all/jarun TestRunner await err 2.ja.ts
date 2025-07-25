import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { err } from "^jab";
import { jtrRunTest } from "../_fixture";

//throw in await promise (after sync part has ended.)

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    inner.await(
      sleeping(10).then(() => {
        inner.imp("You waited on me :-)");

        err("ups");
      })
    );
  });
