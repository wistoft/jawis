import { TestProvision } from "^jarun";

import { filterTestResult, getJarunTestRunner } from "../_fixture";

export default (prov: TestProvision) => {
  const jtr = getJarunTestRunner(prov);

  return jtr
    .runTest("testId", () => () => {
      jtr.handleUhException(new Error("Who owns me?"), "dummy type");
    })
    .then(filterTestResult);
};
