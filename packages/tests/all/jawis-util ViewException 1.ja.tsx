import { TestProvision } from "^jarun";
import { getPrettyHtml } from "^misc/node";

import { getViewException } from "../_fixture";

export default ({ log }: TestProvision) => {
  log(
    "no stack",
    getPrettyHtml(
      getViewException({
        errorData: { msg: "Error message", info: [], parsedStack: [] },
      })
    )
  );
};
