import { TestProvision } from "^jarun";
import { parseTrace } from "^parse-captured-stack";
import { getPrettyHtml } from "^misc/node";

import { getViewExceptionCallStack } from "../_fixture";

// handles projectRoot with ending slash

export default ({ imp }: TestProvision) => {
  imp(
    getPrettyHtml(
      getViewExceptionCallStack({
        projectRoot: "C:\\",
        stack: parseTrace({
          type: "node",
          stack: `error message
        at Object.exports.err (C:\\devSite\\src\\jab\\error.ts:29:9)`,
        }),
      })
    )
  );
};
