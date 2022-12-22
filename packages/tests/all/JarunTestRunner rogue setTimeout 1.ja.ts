import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { jtrRunTest } from "../_fixture";

//throws in timeout after test has ended.

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => {
    setTimeout(() => {
      throw new Error("latey");
    }, 10);
  })
    // give time for Jarun to pick up the rudeness.
    .then(() => sleeping(20));
