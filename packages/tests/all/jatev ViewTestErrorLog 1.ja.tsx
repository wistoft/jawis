import { TestProvision } from "^jarun";

import { getPrettyHtml } from "^misc/node";
import { errorData1, errorData2, getViewTestLog } from "../_fixture";

export default ({ imp, log }: TestProvision) => {
  //only expected

  imp(
    getPrettyHtml(
      getViewTestLog({
        testLog: { type: "err", name: "err", exp: ["hej", "dav"], cur: [] },
      })
    )
  );

  //different

  imp(
    getPrettyHtml(
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
    getPrettyHtml(
      getViewTestLog({
        testLog: { type: "err", name: "err", exp: [], cur: [errorData2] },
      })
    )
  );
};
