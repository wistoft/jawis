import { err } from "^jab";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//test sync throws

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => {
    err("Some values: ", 1, 2, undefined);
  });
