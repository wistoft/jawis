import { TestProvision } from "^jarun";
import { parseTrace } from "^parse-captured-stack";
import { getHtmlRTR } from "^misc/node";

import { getViewExceptionCallStack } from "../_fixture";

// when node_modules is hidden. It shown as '.'

export default ({ log }: TestProvision) => {
  // node error state

  log(
    "node error",
    getHtmlRTR(
      getViewExceptionCallStack({
        stack: parseTrace({
          type: "node",
          stack: `error message
        at funcName (C:\\node_modules\\express\\lib\\router\\layer.js:95:5)`,
        }),
      })
    )
  );
};
