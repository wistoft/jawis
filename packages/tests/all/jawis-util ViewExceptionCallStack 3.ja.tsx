import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^misc/node";
import { parseTrace } from "^util/web";

import { getViewExceptionCallStack } from "../_fixture";

// when node_modules is hidden. It shown as '.'

export default ({ log }: TestProvision) => {
  // node error state

  log(
    "node error",
    getHtmlEnzyme(
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
