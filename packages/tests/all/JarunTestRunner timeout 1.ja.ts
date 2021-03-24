import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//test never resolves

export default (prov: TestProvision) =>
  jtrRunTest(
    prov,
    () => (inner) => {
      inner.imp("will this show?");

      return new Promise(() => {});
    },
    {
      timeoutms: 10,
    }
  );
