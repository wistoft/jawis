import { TestProvision } from "^jarun";
import { parseTrace } from "^parse-captured-stack";
import {
  getPrettyHtml,
  errorData1,
  errorData2,
  getViewExceptionCallStack,
} from "../_fixture";

export default async ({ log }: TestProvision) => {
  // node error state

  log(
    "node error",
    await getPrettyHtml(
      getViewExceptionCallStack({ stack: parseTrace(errorData1.stack) })
    )
  );

  //firefox error state

  log(
    "firefox",
    await getPrettyHtml(
      getViewExceptionCallStack({
        stack: parseTrace(errorData2.stack),
      })
    )
  );
};
