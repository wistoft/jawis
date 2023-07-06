import { TestProvision } from "^jarun";
import { getHtmlRTR } from "^misc/node";

import { getViewException } from "../_fixture";

export default ({ log }: TestProvision) => {
  log(
    "no stack",
    getHtmlRTR(
      getViewException({
        errorData: { msg: "Error message", info: [], parsedStack: [] },
      })
    )
  );
};
