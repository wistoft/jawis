import { TestProvision } from "^jarun";

import { getRogueUpdate_with_test_reports, errorData0 } from "../_fixture";

//error log

export default (prov: TestProvision) => {
  //

  prov.log(
    "test that has no test logs",
    getRogueUpdate_with_test_reports({
      id: "test 1",
      data: { err: [errorData0], user: {} },
    })
  );

  //

  prov.log(
    "test that has same test logs",
    getRogueUpdate_with_test_reports({
      id: "test 2",
      data: { err: [errorData0], user: {} },
    })
  );
};
