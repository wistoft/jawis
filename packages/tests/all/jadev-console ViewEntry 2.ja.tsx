import { TestProvision } from "^jarun";

import { UiEntry } from "^console";
import { getPrettyHtml } from "^misc/node";
import { getViewEntry } from "../_fixture";

export default ({ log }: TestProvision) => {
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
    getPrettyHtml(
      getViewEntry({
        entry: a,
      })
    )
  );
};
