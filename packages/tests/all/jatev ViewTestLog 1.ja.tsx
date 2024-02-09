import { TestProvision } from "^jarun";

import { getPrettyHtml } from "^misc/node";
import { getViewTestLog } from "../_fixture";

//different

export default (prov: TestProvision) => {
  prov.imp(
    getPrettyHtml(
      getViewTestLog({
        testLog: { type: "user", name: "myLog", exp: [2], cur: [1] },
      })
    )
  );
};
