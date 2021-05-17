import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { getSetTestCaseUpdate_empty } from "../_fixture";

// there has to be a test case to update.

//Just ignore this error. Flexibility needed when changing test selections.

export default (prov: TestProvision) => {
  prov.imp(
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
    )
  );
};
