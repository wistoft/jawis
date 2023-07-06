import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { getViewTestLog } from "../_fixture";

//different

export default (prov: TestProvision) => {
  prov.imp(
    getHtmlRTR(
      getViewTestLog({
        testLog: { type: "user", name: "myLog", exp: [2], cur: [1] },
      })
    )
  );
};
