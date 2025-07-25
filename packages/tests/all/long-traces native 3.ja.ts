import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//native error in promise then

declare const notDefined: any;

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  return Promise.resolve()
    .then(function in_then() {
      notDefined; //ReferenceError
    })
    .catch(function hidden(err) {
      consoleLog(filterLongStackTrace(unknownToErrorData(err)));
    });
};
