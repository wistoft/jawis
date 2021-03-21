import { TestProvision } from "^jarun";

import { getJarunTestRunner } from "../_fixture";

export default (prov: TestProvision) => {
  const jtr = getJarunTestRunner(prov);

  return jtr
    .runTest("testId", () => () => "the test")
    .then(() => {
      jtr.handleUhException(new Error("Who owns me?"), "dummy type");
    });
};
