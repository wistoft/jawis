import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//stdout while making test case.

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => {
    console.log("maki maki");
    return () => {};
  });
