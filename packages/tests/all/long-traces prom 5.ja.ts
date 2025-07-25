import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//promise reject function gets stack trace from its own context.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  return new Promise<void>(function executor(resolve, reject) {
    const inner = () => {
      reject(new Error("asdf"));
    };
    inner();
  }).catch((err) => {
    consoleLog(filterLongStackTrace(unknownToErrorData(err)));
  });
};
