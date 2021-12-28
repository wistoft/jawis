import { TestProvision } from "^jarun";

import { getShownTestUpdate_with_shown_test } from "../_fixture";

// given other test is shown, when status is "succeeded" or "failed", nothing changes.

export default (prov: TestProvision) => {
  prov.eq(
    {},
    getShownTestUpdate_with_shown_test({
      id: "succeededTest",
      name: "succeededTest",
      file: "file",
      status: ".",
      testLogs: [],
    })
  );

  prov.eq(
    {},
    getShownTestUpdate_with_shown_test({
      id: "failingTest",
      name: "failingTest",
      file: "file",
      status: 1,
      testLogs: [],
    })
  );
};
