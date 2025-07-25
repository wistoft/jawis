import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//single promise

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  let prom!: Promise<void>;

  const first = () => {
    prom = Promise.resolve();
  };

  first();

  return prom.then(function callback() {
    const inner = () => {
      consoleLog(filterLongStackTrace(unknownToErrorData(new Error())));
    };

    inner();
  });
};
