import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//"Test has ended exception" thrown by prov goes to uh exception.

export default (prov: TestProvision) => {
  let jtr: any;
  let inner: any;

  return jtrRunTest(prov, (_jtr) => (_inner) => {
    jtr = _jtr;
    inner = _inner;
    return "the tests";
  }).then(() => {
    try {
      inner.imp("rogue");
    } catch (error) {
      jtr.handleUhException(error, ["dummy type"]);
    }
  });
};
