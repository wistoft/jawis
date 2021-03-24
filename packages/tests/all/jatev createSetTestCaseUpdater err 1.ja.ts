import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { getSetTestCaseUpdate_empty } from "../_fixture";

// there has to be a test case to update.

export default (prov: TestProvision) => {
  getSetTestCaseUpdate_empty(
    getClientTestReport(
      "1",
      {
        user: {
          blabla: ["What you expect"],
          errMsg: ["some error"],
        },
      },
      {
        user: {
          blabla: ["What you expect"],
          errMsg: [""],
        },
      }
    )
  );
};
