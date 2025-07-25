import { TestProvision } from "^jarun";

import { getPrettyHtml, errorData1, getViewTestLog } from "../_fixture";

export default async ({ imp }: TestProvision) => {
  // as expected

  imp(
    await getPrettyHtml(
      getViewTestLog({
        testLog: {
          type: "err",
          name: "err",
          exp: [errorData1.msg],
          cur: [errorData1],
        },
      })
    )
  );

  // one as expected, and one missing

  imp(
    await getPrettyHtml(
      getViewTestLog({
        testLog: {
          type: "err",
          name: "err",
          exp: [errorData1.msg, "hej"],
          cur: [errorData1],
        },
      })
    )
  );
};
