import { TestProvision } from "^jarun";

import { getShownTestUpdate_with_shown_test } from "../_fixture";

// given same test is shown, things happen

export default (prov: TestProvision) => {
  prov.imp(
    getShownTestUpdate_with_shown_test({
      id: "test 1",
      status: ".",
      testLogs: [],
    })
  );
};
