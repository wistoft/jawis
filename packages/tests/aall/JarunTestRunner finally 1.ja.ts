import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => (inner) => {
    console.log("dav");

    inner.finally(() => {
      console.log("hej");
    });

    return "ret";
  });
