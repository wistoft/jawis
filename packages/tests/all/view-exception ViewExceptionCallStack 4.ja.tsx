import { TestProvision } from "^jarun";
import { parseTrace } from "^parse-captured-stack";
import { getPrettyHtml, getViewExceptionCallStack } from "../_fixture";

// handles projectRoot with ending slash

export default async ({ imp }: TestProvision) => {
  imp(
    await getPrettyHtml(
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
