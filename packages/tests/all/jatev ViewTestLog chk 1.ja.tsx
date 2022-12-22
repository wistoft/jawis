import { TestProvision } from "^jarun";

import { capture } from "^jab";
import { getHtmlEnzyme } from "^misc/node";
import { errorData1, getViewTestLog } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(
    getHtmlEnzyme(
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
