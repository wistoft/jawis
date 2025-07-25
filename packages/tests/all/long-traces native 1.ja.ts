import fs from "node:fs";
import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//native error in node style api

//not impl - because node makes a copy of global objects, so not to be affected by monkey patching.

//node gives no stack trace at all for this.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  const outer = () => {
    fs.stat("asdf", function inner(err) {
      consoleLog(filterLongStackTrace(unknownToErrorData(err)));
    });
  };

  outer();
};
