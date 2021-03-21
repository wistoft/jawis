import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^jawis-mess/node";
import { parseBacktrace } from "^jawis-util/web";

import { getViewExceptionCallStack } from "../_fixture";

// handles projectRoot with ending slash

export default ({ imp }: TestProvision) => {
  imp(
    getHtmlEnzyme(
      getViewExceptionCallStack({
        projectRoot: "C:\\",
        stack: parseBacktrace(`error message
        at Object.exports.err (C:\\devSite\\src\\jab\\error.ts:29:9)`),
      })
    )
  );
};
