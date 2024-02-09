import { TestProvision } from "^jarun";

import { getPrettyHtml } from "^misc/node";
import { TestState } from "^jatev/types";
import { getViewTest } from "../_fixture";

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

  prov.imp(getPrettyHtml(getViewTest(test)));
};
