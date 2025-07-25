import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { renderUseJatevDirector_with_tests } from "../_fixture";

// execution result, while test case shown

export default (prov: TestProvision) => {
  const { result, rerender, onServerMessage } =
    renderUseJatevDirector_with_tests(prov);

  result.onNext();

  //first time, when there's no test logs

  onServerMessage({
    type: "TestReport",
    data: getClientTestReport(
      "test 1",
      { user: { blabla: ["What you expect"] } },
      { user: { blabla: ["First attempt"] } }
    ),
  });

  //

  const r1 = rerender();

  prov.imp(r1.state.currentTest);
  prov.imp(r1.state.currentTestFressness);

  //second time, when there's are old test logs

  onServerMessage({
    type: "TestReport",
    data: getClientTestReport(
      "test 1",
      { user: { blabla: ["What you expect"] } },
      { user: { blabla: ["Second attempt"] } }
    ),
  });

  //

  const r2 = rerender();

  prov.imp(r2.state.currentTest);
  prov.imp(r2.state.currentTestFressness);
};
