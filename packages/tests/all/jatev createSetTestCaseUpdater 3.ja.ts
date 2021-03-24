import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { getSetTestCaseUpdate_with_tests, errorData1 } from "../_fixture";

// error data is fixed in exp log. It should only have been string.

export default (prov: TestProvision) => {
  prov.imp(
    getSetTestCaseUpdate_with_tests(
      getClientTestReport(
        "test 1",
        {
          err: [errorData1.msg],
          user: {},
        },
        {
          err: [errorData1],
          user: {},
        }
      )
    )
  );
};
