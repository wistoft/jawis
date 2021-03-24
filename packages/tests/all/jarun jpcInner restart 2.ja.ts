import { TestProvision } from "^jarun";

import { getJpcInner } from "../_fixture";

//restart when testing

export default (prov: TestProvision) => {
  const jpcInner = getJpcInner(prov);

  const p = jpcInner.runTest("testId", "testFile");

  jpcInner.onRestarted();

  jpcInner.onMessage({ type: "testDone", value: { cur: { user: {} } } });

  return p;
};
