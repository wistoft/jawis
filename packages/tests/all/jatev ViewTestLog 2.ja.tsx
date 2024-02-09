import { TestProvision } from "^jarun";

import { getPrettyHtml } from "^misc/node";
import { getViewTestLog } from "../_fixture";

//rogue logs
// aren't shown (initially)
// doesn't show controls.

export default (prov: TestProvision) => {
  prov.imp(
    getPrettyHtml(
      getViewTestLog({
        testLog: { type: "user", name: "rogue.mylog", exp: [2], cur: [1] },
      })
    )
  );
};
