import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^jawis-mess/node";
import { errorData1, errorData2, getViewTestLog } from "../_fixture";

export default ({ imp, log }: TestProvision) => {
  //only expected

  imp(
    getHtmlEnzyme(
      getViewTestLog({
        testLog: { type: "err", name: "err", exp: ["hej", "dav"], cur: [] },
      })
    )
  );

  //different

  imp(
    getHtmlEnzyme(
      getViewTestLog({
        testLog: { type: "err", name: "err", exp: ["hej"], cur: [errorData1] },
      })
    )
  );

  //only current

  log(
    "only current",
    getHtmlEnzyme(
      getViewTestLog({
        testLog: { type: "err", name: "err", exp: [], cur: [errorData2] },
      })
    )
  );
};
