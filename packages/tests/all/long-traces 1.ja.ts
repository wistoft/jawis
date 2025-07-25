import async_hooks from "node:async_hooks";

import { makeJabError, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { enable } from "^long-traces";
import { getPromise } from "^yapu";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

// Error trace request in later context. But retains trace from creation context.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  const prom = getPromise<any>();

  setTimeout(function outer() {
    function inner() {
      prom.resolve(makeJabError("asdf"));
    }
    inner();
  });

  return prom.promise.then((err) => {
    consoleLog(filterLongStackTrace(unknownToErrorData(err)));
  });
};
