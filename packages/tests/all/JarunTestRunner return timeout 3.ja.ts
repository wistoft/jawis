import { nightmare, sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//one of the returned promises rejects late

export default (prov: TestProvision) =>
  jtrRunTest(
    prov,
    () => (inner) => {
      inner.imp("will this show?");
      return [Promise.resolve("hej"), nightmare(30, "I'm here")];
    },
    {
      timeoutms: 10,
    }
  )
    .then(prov.imp)
    .then(() => sleeping(50));
