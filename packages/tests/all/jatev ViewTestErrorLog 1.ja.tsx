import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { errorData1, errorData2, getViewTestLog } from "../_fixture";

export default ({ imp, log }: TestProvision) => {
  //only expected

  imp(
    getHtmlRTR(
      getViewTestLog({
        testLog: { type: "err", name: "err", exp: ["hej", "dav"], cur: [] },
      })
    )
  );

  //different

  imp(
    getHtmlRTR(
      getViewTestLog({
        testLog: {
          type: "err",
          name: "err",
          exp: ["hej"],
          cur: [errorData1],
        },
      })
    )
  );

  //only current

  log(
    "only current",
    getHtmlRTR(
      getViewTestLog({
        testLog: { type: "err", name: "err", exp: [], cur: [errorData2] },
      })
    )
  );
};
