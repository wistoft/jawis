import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^jawis-mess/node";
import { clone } from "^jab";
import { errorData1, getViewTestLog } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(
    getHtmlEnzyme(
      getViewTestLog({
        testLog: {
          type: "chk",
          name: "chk",
          exp: clone(1),
          cur: clone(2),
          stack: errorData1.stack,
        },
      })
    )
  );
};
