import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^misc/node";
import { parseTrace } from "^util-javi/web";

import { getViewExceptionCallStack } from "../_fixture";

// when node_modules is shown as system frame.

export default ({ log }: TestProvision) => {
  // node error state

  log(
    "node error",
    getHtmlEnzyme(
      getViewExceptionCallStack({
        initialShowSystemFrames: true,
        stack: parseTrace({
          type: "node",
          stack: `error message
        at funcName (C:\\node_modules\\express\\lib\\router\\layer.js:95:5)`,
        }),
      })
    )
  );
};
