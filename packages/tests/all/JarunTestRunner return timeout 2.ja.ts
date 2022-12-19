import { sleeping, sleepingValue } from "^yapu";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//one of the returned promises resolves late

export default (prov: TestProvision) =>
  jtrRunTest(
    prov,
    () => (inner) => {
      inner.imp("will this show?");
      return [Promise.resolve("hej"), sleepingValue(30, "I'm here")];
    },
    {
      timeoutms: 10,
    }
  )
    .then(prov.imp)
    .then(() => sleeping(50));
