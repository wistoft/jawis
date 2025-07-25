import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//exception reaches exception handler while test is running

export default (prov: TestProvision) =>
  jtrRunTest(prov, (jtr) => () => {
    jtr.handleUhException(new Error("Who owns me?"), ["dummy type"]);
  });
