import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^misc/node";

import { getViewException } from "../_fixture";

export default ({ log }: TestProvision) => {
  log(
    "no stack",
    getHtmlEnzyme(
      getViewException({
        errorData: { msg: "Error message", info: [], parsedStack: [] },
      })
    )
  );
};
//
