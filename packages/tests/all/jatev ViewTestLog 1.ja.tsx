import { TestProvision } from "^jarun";

import { getPrettyHtml, getViewTestLog } from "../_fixture";

//different

export default async (prov: TestProvision) => {
  prov.imp(
    await getPrettyHtml(
      getViewTestLog({
        testLog: { type: "user", name: "myLog", exp: [2], cur: [1] },
      })
    )
  );
};
