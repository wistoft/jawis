import { TestProvision } from "^jarun";

import { getJpcInner } from "../_fixture";

//jarun process exits while testing

export default (prov: TestProvision) => {
  const jpcInner = getJpcInner(prov);

  const p = jpcInner.runTest("testId", "testFile");

  jpcInner.onUnexpectedExit();

  return p;
};
