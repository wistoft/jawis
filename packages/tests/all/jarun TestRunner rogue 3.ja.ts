import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//uh exception after test ends.

export default (prov: TestProvision) => {
  let jtr: any;

  return jtrRunTest(prov, (_jtr) => () => {
    jtr = _jtr;
    return "the tests";
  }).then(() => {
    jtr.handleUhException(new Error("Who owns me?"), ["dummy type"]);
  });
};
