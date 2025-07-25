import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//async/await - promise rejection

//nearly works, but note that typescript downlevels to generator.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = async () => {
  enable(async_hooks);

  const callback = () => new Error("asdf");

  const err = await Promise.resolve().then(callback);

  const notShown = () => {
    consoleLog(filterLongStackTrace(unknownToErrorData(err)));
  };

  notShown();
};
