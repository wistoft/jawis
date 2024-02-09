import { TestProvision } from "^jarun";

import { getPrettyHtml } from "^misc/node";
import { getViewExecutionLevel } from "../_fixture";

export default (prov: TestProvision) => {
  prov.log("no tests", getPrettyHtml(getViewExecutionLevel({ level: [] })));

  // no result

  prov.log(
    "test with no status",
    getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1" }],
      })
    )
  );

  // has error

  prov.log(
    "test with status 1",
    getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1", status: 1 }],
      })
    )
  );

  // has no error

  prov.log(
    "test that passes",
    getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1", status: "." }],
      })
    )
  );

  // current test

  prov.log(
    "test that is shown",
    getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1" }],
        currentTestId: "test 1",
      })
    )
  );

  //executing test

  prov.log(
    "test that is executing",
    getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1" }],
        executingTestId: "test 1",
      })
    )
  );
};
