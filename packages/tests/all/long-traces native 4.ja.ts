import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import { getPromise } from "^yapu";
import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//native error in promise reject

declare const notDefined: any;

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  const prom = getPromise<void>();

  setTimeout(function outer() {
    try {
      notDefined; //ReferenceError
    } catch (error: any) {
      prom.reject(error);
    }
  });

  return prom.promise.catch(function hidden(err) {
    consoleLog(filterLongStackTrace(unknownToErrorData(err)));
  });
};
