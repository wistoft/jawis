import { TestProvision } from "^jarun";

import { TestState } from "^jatev/types";
import { getPrettyHtml, getViewTest } from "../_fixture";

export default async (prov: TestProvision) => {
  const test: TestState = {
    id: "1",
    name: "1",
    file: "file",
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

  prov.imp(await getPrettyHtml(getViewTest(test)));
};
