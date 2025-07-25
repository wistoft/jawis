import { TestProvision } from "^jarun";

import {
  getPrettyHtml,
  errorData1,
  errorData2,
  getViewTestLog,
} from "../_fixture";

export default async ({ imp, log }: TestProvision) => {
  //only expected

  imp(
    await getPrettyHtml(
      getViewTestLog({
        testLog: { type: "err", name: "err", exp: ["hej", "dav"], cur: [] },
      })
    )
  );

  //different

  imp(
    await getPrettyHtml(
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
    await getPrettyHtml(
      getViewTestLog({
        testLog: { type: "err", name: "err", exp: [], cur: [errorData2] },
      })
    )
  );
};
