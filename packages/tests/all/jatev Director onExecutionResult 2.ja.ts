import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { renderUseJatevDirector_with_tests } from "../_fixture";

// execution result, while test case shown, but another test case that failed.

export default (prov: TestProvision) => {
  const {
    result,
    rerender,
    onServerMessage,
  } = renderUseJatevDirector_with_tests(prov);

  result.callbacks.onNext();

  onServerMessage({
    type: "TestReport",
    data: getClientTestReport(
      "test 2",
      { user: { blabla: ["What you expect "] } },
      { user: { blabla: ["failed"] } }
    ),
  });

  const r1 = rerender();

  prov.imp(r1.state.currentTest);
  prov.imp(r1.state.currentTestFressness);
};
