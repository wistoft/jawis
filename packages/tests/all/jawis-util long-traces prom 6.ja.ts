import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//promise context created in same scope must not include the common overlap
//in other words: `then` must only contribute with one stack frame.

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

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
        console.log( filterStackTrace(unknownToErrorData(new Error("ups"))) ); // prettier-ignore
      };

      prom.then(last);
    };

    inner2();
  };

  second();
};
