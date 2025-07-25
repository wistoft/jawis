import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//promise created in promise

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  return Promise.resolve().then(function outer() {
    return Promise.resolve().then(function inner() {
      const last = () => {
        consoleLog(filterLongStackTrace(unknownToErrorData(new Error())));
      };

      last();
    });
  });
};
