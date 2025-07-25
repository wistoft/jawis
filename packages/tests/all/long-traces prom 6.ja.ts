import async_hooks from "node:async_hooks";

import { unknownToErrorData } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import {
  runLiveJacsBee_lazy,
  filterLongStackTrace,
  consoleLog,
} from "../_fixture";

//not impl

//not sure `then` contributes anything. Should it do that.

//promise context created in same scope must not include the common overlap
//in other words: `then` must only contribute with one stack frame.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  //`first` creates the initial promise, which includes all parent stack frames.

  let prom: any;

  const first = () => {
    const inner = () => {
      prom = Promise.resolve();
    };
    inner();
  };

  first();

  //`then` creates chained promise, that only includes one stack frame.

  const second = () => {
    const inner2 = () => {
      const last = () => {
        consoleLog(filterLongStackTrace(unknownToErrorData(new Error("ups"))) ); // prettier-ignore
      };

      prom.then(last);
    };

    inner2();
  };

  second();
};
