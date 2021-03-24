import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { getSetTestCaseUpdate_with_tests } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(
    getSetTestCaseUpdate_with_tests(
      getClientTestReport(
        "test 1",
        {
          err: ["error before that bla"],
          user: {
            blabla: ["What you expect"],
          },
        },
        {
          user: {
            blabla: ["What you expect"],
          },
        }
      )
    )
  );
};
