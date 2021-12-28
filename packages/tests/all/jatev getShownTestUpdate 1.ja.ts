import { TestProvision } from "^jarun";

import { getShownTestUpdate_empty } from "../_fixture";

// given nothing is shown, when status is "failed", show the test

export default (prov: TestProvision) => {
  prov.imp(
    getShownTestUpdate_empty({
      id: "failingTest",
      name: "failingTest",
      file: "file",
      status: 1,
      testLogs: [],
    })
  );
};
