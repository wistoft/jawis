import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { errorData0, renderUseJatevDirector_with_tests } from "../_fixture";

// rogue error (with existing test report)

export default (prov: TestProvision) => {
  const {
    result,
    rerender,
    onServerMessage,
  } = renderUseJatevDirector_with_tests(prov);

  // setup test with no test logs

  onServerMessage({
    type: "TestReport",
    data: getClientTestReport("test 1", { user: {} }, { user: {} }),
  });

  // the rogue data

  onServerMessage({
    type: "OnRogue",
    data: { id: "test 1", data: { err: [errorData0], user: {} } },
  });

  prov.log(
    "test with empty test logs",
    rerender().state.tests?.getTest("test 1")
  );
};
