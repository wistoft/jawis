import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^jawis-mess/node";
import { getViewTestLog } from "../_fixture";

//different

export default (prov: TestProvision) => {
  prov.imp(
    getHtmlEnzyme(
      getViewTestLog({
        testLog: { type: "user", name: "myLog", exp: [2], cur: [1] },
      })
    )
  );
};
