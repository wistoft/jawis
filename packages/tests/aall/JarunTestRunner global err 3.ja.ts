import { TestProvision, createJarunPromise } from "^jarun";

import { getJarunTestRunner } from "../_fixture";

//change global.Promise before test

export default (prov: TestProvision) => {
  const jtr = getJarunTestRunner(prov);

  // eslint-disable-next-line no-global-assign
  Promise = createJarunPromise(prov as any);

  return jtr.runTest("testId", () => () => {});
};
