import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//export like a ts-file: export default

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => ({
    default: (inner) => {
      inner.imp("the test");
    },
  }));
