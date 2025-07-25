import fs from "node:fs";
import async_hooks from "node:async_hooks";

import { assert, unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//error thrown in successful native async callbacks.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  const outer = () => {
    fs.stat(__dirname, function inner(err) {
      assert(!err);
      const last = () => {
        consoleLog(filterLongStackTrace(unknownToErrorData(new Error())));
      };

      last();
    });
  };

  outer();
};
