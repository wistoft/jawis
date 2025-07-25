import { TestProvision } from "^jarun";

import { getPrettyHtml, getViewTestLog } from "../_fixture";

//rogue logs
// aren't shown (initially)
// doesn't show controls.

export default async (prov: TestProvision) => {
  prov.imp(
    await getPrettyHtml(
      getViewTestLog({
        testLog: { type: "user", name: "rogue.mylog", exp: [2], cur: [1] },
      })
    )
  );
};
