import { TestProvision } from "^jarun";

import { getJpcInner } from "../_fixture";

// run test after onUnexpectedExit

export default (prov: TestProvision) => {
  const jpcInner = getJpcInner(prov);

  prov.await(jpcInner.runTest("testId", "testFile"));

  jpcInner.onUnexpectedExit();

  prov.await(jpcInner.runTest("testId", "dummy.js"));
};
