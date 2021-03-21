import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => {
    global.setTimeout = 5 as any;
  });
