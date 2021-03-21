import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { renderUseJatevDirector_with_tests } from "../_fixture";

// execution result, while nothing shown, but a test case that failed.

export default (prov: TestProvision) => {
  const {
    result,
    rerender,
    onServerMessage,
  } = renderUseJatevDirector_with_tests(prov);

  onServerMessage({
    type: "TestReport",
    data: getClientTestReport(
      "test 1",
      { user: { blabla: ["What you expect"] } },
      { user: { blabla: ["Not good."] } }
    ),
  });

  const r1 = rerender();

  prov.imp(r1.state.currentTest);
  prov.imp(r1.state.currentTestFressness);
};
