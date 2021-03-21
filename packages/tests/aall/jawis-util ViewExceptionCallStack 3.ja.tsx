import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^jawis-mess/node";
import { parseBacktrace } from "^jawis-util/web";

import { getViewExceptionCallStack } from "../_fixture";

// when node_modules is hidden. It shown as '.'

export default ({ log }: TestProvision) => {
  // node error state

  log(
    "node error",
    getHtmlEnzyme(
      getViewExceptionCallStack({
        stack: parseBacktrace(`error message
        at funcName (C:\\node_modules\\express\\lib\\router\\layer.js:95:5)`),
      })
    )
  );
};
