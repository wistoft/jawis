import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^jawis-mess/node";
import { errorData1, getViewTestLog } from "../_fixture";

export default ({ imp }: TestProvision) => {
  // as expected

  imp(
    getHtmlEnzyme(
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
    getHtmlEnzyme(
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
