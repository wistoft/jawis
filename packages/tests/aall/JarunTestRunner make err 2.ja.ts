import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//exception while making test case

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => {
    throw new Error("didn't make out");
  });
