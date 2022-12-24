import { TestProvision } from "^jarun";
import { parseTrace } from "^parse-captured-stack";
import { getHtmlEnzyme } from "^misc/node";

import { errorData1, errorData2, getViewExceptionCallStack } from "../_fixture";

export default ({ log }: TestProvision) => {
  // node error state

  log(
    "node error",
    getHtmlEnzyme(
      getViewExceptionCallStack({ stack: parseTrace(errorData1.stack) })
    )
  );

  //firefox error state

  log(
    "firefox",
    getHtmlEnzyme(
      getViewExceptionCallStack({
        stack: parseTrace(errorData2.stack),
      })
    )
  );
};
