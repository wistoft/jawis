import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

// Error trace requested in child context. But trace still reflects parent context.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  setTimeout(() => {
    const err = new Error("asdf");

    setTimeout(() => {
      consoleLog(filterLongStackTrace(unknownToErrorData(err)));
    });
  });
};
