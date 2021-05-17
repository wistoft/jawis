import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { getSetTestCaseUpdate_with_tests } from "../_fixture";

// test id doesn't exist is just ignored

//Just ignore this error. Flexibility needed when changing test selections.

export default (prov: TestProvision) => {
  prov.imp(
    getSetTestCaseUpdate_with_tests(
      getClientTestReport("dontExist", { user: {} }, { user: {} })
    )
  );
};
