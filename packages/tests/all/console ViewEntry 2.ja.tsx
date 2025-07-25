import { TestProvision } from "^jarun";

import { UiEntry } from "^console";
import { getPrettyHtml, getViewEntry } from "../_fixture";

export default async ({ log }: TestProvision) => {
  const a: UiEntry = {
    id: 123456,
    type: "error",
    context: "browser",
    data: {
      msg: "Error: RawJabError: find values :-)\n",
      info: [],
      parsedStack: [],
    },
  };

  log(
    "error log without parsed stack",
    await getPrettyHtml(
      getViewEntry({
        entry: a,
      })
    )
  );
};
