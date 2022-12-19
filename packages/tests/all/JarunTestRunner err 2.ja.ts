import { makeJabError } from "^jab";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//test sync throws

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => {
    throw makeJabError("Some values: ", 1, 2, undefined);
  });
