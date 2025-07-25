import { TestProvision } from "^jarun";

import { getPrettyHtml, getViewExecutionLevel } from "../_fixture";

export default async (prov: TestProvision) => {
  prov.log(
    "no tests",
    await getPrettyHtml(getViewExecutionLevel({ level: [] }))
  );

  // no result

  prov.log(
    "test with no status",
    await getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1", name: "1", file: "file" }],
      })
    )
  );

  // has error

  prov.log(
    "test with status 1",
    await getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1", name: "1", file: "file", status: 1 }],
      })
    )
  );

  // has no error

  prov.log(
    "test that passes",
    await getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1", name: "1", file: "file", status: "." }],
      })
    )
  );

  // current test

  prov.log(
    "test that is shown",
    await getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1", name: "1", file: "file" }],
        currentTestId: "test 1",
      })
    )
  );

  //executing test

  prov.log(
    "test that is executing",
    await getPrettyHtml(
      getViewExecutionLevel({
        level: [{ id: "test 1", name: "1", file: "file" }],
        executingTestId: "test 1",
      })
    )
  );
};
