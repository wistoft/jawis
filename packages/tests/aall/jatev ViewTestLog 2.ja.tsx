import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^jawis-mess/node";
import { getViewTestLog } from "../_fixture";

//rogue logs
// aren't shown (initially)
// doesn't show controls.

export default (prov: TestProvision) => {
  prov.imp(
    getHtmlEnzyme(
      getViewTestLog({
        testLog: { type: "user", name: "rogue.mylog", exp: [2], cur: [1] },
      })
    )
  );
};
