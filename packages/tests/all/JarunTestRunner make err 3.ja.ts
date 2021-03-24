import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//doesn't return a test-function

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => "not at test case" as any);
