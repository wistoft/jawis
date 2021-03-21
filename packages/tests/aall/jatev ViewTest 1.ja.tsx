import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^jawis-mess/node";
import { getViewTest } from "../_fixture";
import { TestState } from "^jatev/types";

export default (prov: TestProvision) => {
  const test: TestState = {
    id: "1",
    testLogs: [
      // testLogs aren't sorted here.
      {
        type: "user",
        name: "blabla",
        cur: ["What you expect"],
        exp: ["What you expect"],
      },
      {
        type: "user",
        name: "errMsg",
        cur: ["some error"],
        exp: [""],
      },
    ],
  };

  prov.imp(getHtmlEnzyme(getViewTest(test)));
};
