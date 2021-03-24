import { nightmare, sleeping } from "^jab";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//test rejects late

export default (prov: TestProvision) =>
  jtrRunTest(
    prov,
    () => (inner) => {
      inner.imp("will this show?");
      return nightmare(30, "I'm here");
    },
    {
      timeoutms: 10,
    }
  )
    .then(prov.imp)
    .then(() => sleeping(50));
