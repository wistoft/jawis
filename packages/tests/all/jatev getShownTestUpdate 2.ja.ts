import { TestProvision } from "^jarun";

import { getShownTestUpdate_empty } from "../_fixture";

// given nothing is shown, when status is "succeeded", don't show the test

export default (prov: TestProvision) => {
  prov.eq(
    {},
    getShownTestUpdate_empty({
      id: "succeededTest",
      name: "succeededTest",
      file: "file",
      status: ".",
      testLogs: [],
    })
  );
};
