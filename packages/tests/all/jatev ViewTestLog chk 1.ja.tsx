import { TestProvision } from "^jarun";

import { capture } from "^jab";
import { getPrettyHtml, errorData1, getViewTestLog } from "../_fixture";

export default async ({ imp }: TestProvision) => {
  imp(
    await getPrettyHtml(
      getViewTestLog({
        testLog: {
          type: "chk",
          name: "chk",
          exp: capture(1),
          cur: capture(2),
          stack: errorData1.stack,
        },
      })
    )
  );
};
