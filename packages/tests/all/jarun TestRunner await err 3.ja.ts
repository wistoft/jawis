import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//throw in await promise right away.

//this case is interesting, because a catch must be attached right away to rejecting promises
// otherwise will node give a warning, and throw uh-promise.

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    inner.await(Promise.reject(new Error("hej")));

    return sleeping(5); //wait needed to see if node is satisfied
  });
