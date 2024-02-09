import { TestProvision } from "^jarun";
import { parseTrace } from "^parse-captured-stack";
import { getPrettyHtml } from "^misc/node";

import { errorData1, errorData2, getViewExceptionCallStack } from "../_fixture";

export default ({ log }: TestProvision) => {
  // node error state

  log(
    "node error",
    getPrettyHtml(
      getViewExceptionCallStack({ stack: parseTrace(errorData1.stack) })
    )
  );

  //firefox error state

  log(
    "firefox",
    getPrettyHtml(
      getViewExceptionCallStack({
        stack: parseTrace(errorData2.stack),
      })
    )
  );
};
