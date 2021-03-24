import { prej } from "^jab";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//return array of promises

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => [Promise.resolve("hej"), prej("dav")]);
