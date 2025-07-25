import { TestProvision } from "^jarun";

import { getJpcInner } from "../_fixture";

// run test after onUnexpectedExit

export default (prov: TestProvision) => {
  const jpcInner = getJpcInner(prov);

  const test1 = jpcInner.runTest("testId", "testFile");

  jpcInner.onUnexpectedExit();

  return test1.catch((error) => {
    prov.onError(error);
    return jpcInner.runTest("testId", "dummy.js");
  });
};
