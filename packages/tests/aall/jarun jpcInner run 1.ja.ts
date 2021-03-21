import { TestProvision } from "^jarun";

import { getJpcInner } from "../_fixture";

//successful run

export default (prov: TestProvision) => {
  const jpcInner = getJpcInner(prov);

  const p = jpcInner.runTest("testId", "testFile");

  jpcInner.onMessage({ type: "testDone", value: { cur: { user: {} } } });

  return p;
};
