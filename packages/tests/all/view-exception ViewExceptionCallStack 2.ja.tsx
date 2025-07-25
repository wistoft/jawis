import { TestProvision } from "^jarun";
import { parseTrace } from "^parse-captured-stack";
import { getPrettyHtml, getViewExceptionCallStack } from "../_fixture";

// when node_modules is shown as system frame.

export default async ({ log }: TestProvision) => {
  // node error state

  log(
    "node error",
    await getPrettyHtml(
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
