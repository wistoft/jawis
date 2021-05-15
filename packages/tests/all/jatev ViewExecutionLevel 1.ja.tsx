import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^misc/node";
import { getViewExecutionLevel } from "../_fixture";

export default (prov: TestProvision) => {
  prov.log("no tests", getHtmlEnzyme(getViewExecutionLevel({ level: [] })));

  // no result

  prov.log(
    "test with no status",
    getHtmlEnzyme(
      getViewExecutionLevel({
        level: [{ id: "test 1" }],
      })
    )
  );

  // has error

  prov.log(
    "test with status 1",
    getHtmlEnzyme(
      getViewExecutionLevel({
        level: [{ id: "test 1", status: 1 }],
      })
    )
  );

  // has no error

  prov.log(
    "test that passes",
    getHtmlEnzyme(
      getViewExecutionLevel({
        level: [{ id: "test 1", status: "." }],
      })
    )
  );

  // current test

  prov.log(
    "test that is shown",
    getHtmlEnzyme(
      getViewExecutionLevel({
        level: [{ id: "test 1" }],
        currentTestId: "test 1",
      })
    )
  );

  //executing test

  prov.log(
    "test that is executing",
    getHtmlEnzyme(
      getViewExecutionLevel({
        level: [{ id: "test 1" }],
        executingTestId: "test 1",
      })
    )
  );
};
