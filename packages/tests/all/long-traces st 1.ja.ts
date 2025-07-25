import async_hooks from "node:async_hooks";

import { AbsoluteFile, unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//single nested setTimeout

export default (prov: TestProvision) =>
  runLiveJacsBee_lazy(prov, __filename as AbsoluteFile);

export const main = () => {
  enable(async_hooks);

  setTimeout(() => {
    consoleLog(filterLongStackTrace(unknownToErrorData(new Error())));
  }, 0);
};
