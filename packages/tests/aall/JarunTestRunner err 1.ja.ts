import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//test sync throws

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => {
    throw new Error("You asked for it.");
  });
