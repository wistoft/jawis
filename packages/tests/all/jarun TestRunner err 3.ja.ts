import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import { jtrRunTest } from "../_fixture";

//uh exception in setTimeout while test executes.

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => {
    setTimeout(() => {
      throw new Error("ups.");
    }, 10);
    return sleeping(20);
  });
