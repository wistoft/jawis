import { TestProvision } from "^jarun";

import { getPrettyHtml } from "^misc/node";
import { errorData1, getViewTestLog } from "../_fixture";

export default ({ imp }: TestProvision) => {
  // as expected

  imp(
    getPrettyHtml(
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
    getPrettyHtml(
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
