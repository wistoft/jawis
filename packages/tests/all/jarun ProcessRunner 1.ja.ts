import { TestProvision } from "^jarun";

import { getScriptPath, prRunTest } from "../_fixture";

export default (prov: TestProvision) => {
  const { promise } = prRunTest(prov, getScriptPath("hello.js"));

  return promise;
};
