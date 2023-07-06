import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { getViewExecutionLevel } from "../_fixture";

export default (prov: TestProvision) => {
  prov.log("no tests", getHtmlRTR(getViewExecutionLevel({ level: [] })));

  // no result

  prov.log(
    "test with no status",
    getHtmlRTR(
      getViewExecutionLevel({
        level: [{ id: "test 1" }],
      })
    )
  );

  // has error

  prov.log(
    "test with status 1",
    getHtmlRTR(
      getViewExecutionLevel({
        level: [{ id: "test 1", status: 1 }],
      })
    )
  );

  // has no error

  prov.log(
    "test that passes",
    getHtmlRTR(
      getViewExecutionLevel({
        level: [{ id: "test 1", status: "." }],
      })
    )
  );

  // current test

  prov.log(
    "test that is shown",
    getHtmlRTR(
      getViewExecutionLevel({
        level: [{ id: "test 1" }],
        currentTestId: "test 1",
      })
    )
  );

  //executing test

  prov.log(
    "test that is executing",
    getHtmlRTR(
      getViewExecutionLevel({
        level: [{ id: "test 1" }],
        executingTestId: "test 1",
      })
    )
  );
};
