import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//one of the returned promises never resolves

export default (prov: TestProvision) =>
  jtrRunTest(
    prov,
    () => (inner) => {
      inner.imp("will this show?");

      return [Promise.resolve("hej"), new Promise(() => {})];
    },
    {
      timeoutms: 10,
    }
  );
