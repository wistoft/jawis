import { TestProvision } from "^jarun";

import { getJarunTestRunner } from "../_fixture";

export default (prov: TestProvision) => {
  const jtr = getJarunTestRunner(prov);

  global.setTimeout = 5 as any;

  return jtr.runTest("testId", () => Promise.resolve(() => {}));
};
