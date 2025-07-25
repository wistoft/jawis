import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//double nested setTimeout

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  setTimeout(() => {
    //`inner` function: to get a stack frame in this scope
    const inner = () => {
      setTimeout(() => {
        consoleLog(filterLongStackTrace(unknownToErrorData(new Error())));
      }, 0);
    };

    inner();
  }, 0);
};
