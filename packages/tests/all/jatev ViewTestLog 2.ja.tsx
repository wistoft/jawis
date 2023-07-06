import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { getViewTestLog } from "../_fixture";

//rogue logs
// aren't shown (initially)
// doesn't show controls.

export default (prov: TestProvision) => {
  prov.imp(
    getHtmlRTR(
      getViewTestLog({
        testLog: { type: "user", name: "rogue.mylog", exp: [2], cur: [1] },
      })
    )
  );
};
