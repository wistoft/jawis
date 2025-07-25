import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//promise resolve function isn't included anywhere. Because it's not part of the stack.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  return new Promise<void>((resolve) => {
    const func = () => {
      resolve();
    };
    func();
  }).then(function callback() {
    consoleLog(filterLongStackTrace(unknownToErrorData(new Error("ups"))));
  });
};
