import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//promise rejection

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  return Promise.resolve()
    .then(function callback() {
      const inner = () => {
        throw new Error("asdf");
      };
      inner();
    })
    .catch((err) => {
      consoleLog(filterLongStackTrace(unknownToErrorData(err)));
    });
};
