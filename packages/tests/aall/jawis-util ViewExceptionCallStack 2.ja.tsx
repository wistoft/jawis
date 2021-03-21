import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^jawis-mess/node";
import { parseBacktrace } from "^jawis-util/web";

import { getViewExceptionCallStack } from "../_fixture";

// when node_modules is shown as system frame.

export default ({ log }: TestProvision) => {
  // node error state

  log(
    "node error",
    getHtmlEnzyme(
      getViewExceptionCallStack({
        initialShowSystemFrames: true,
        stack: parseBacktrace(`error message
        at funcName (C:\\node_modules\\express\\lib\\router\\layer.js:95:5)`),
      })
    )
  );
};
