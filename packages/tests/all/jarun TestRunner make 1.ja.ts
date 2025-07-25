import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//export like a js-file: module.exports

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    inner.imp("the test");
  });
