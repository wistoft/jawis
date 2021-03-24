import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { getSetTestCaseUpdate_with_tests } from "../_fixture";

// no test logs

export default (prov: TestProvision) => {
  prov.imp(
    getSetTestCaseUpdate_with_tests(
      getClientTestReport("test 1", { user: {} }, { user: {} })
    )
  );
};
