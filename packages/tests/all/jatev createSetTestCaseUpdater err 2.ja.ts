import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { getSetTestCaseUpdate_with_tests } from "../_fixture";

// test id doesn't exist

export default (prov: TestProvision) => {
  prov.imp(
    getSetTestCaseUpdate_with_tests(
      getClientTestReport("dontExist", { user: {} }, { user: {} })
    )
  );
};
