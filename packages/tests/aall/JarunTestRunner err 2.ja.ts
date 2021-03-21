import { JabError } from "^jab";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//test sync throws

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => {
    throw new JabError("Some values: ", 1, 2, undefined);
  });
