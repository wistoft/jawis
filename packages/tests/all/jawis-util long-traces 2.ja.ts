import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//double nested setTimeout

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  setTimeout(() => {
    //`inner` function: to get a stack frame in this scope
    const inner = () => {
      setTimeout(() => {
        console.log(filterStackTrace(unknownToErrorData(new Error())));
      }, 0);
    };

    inner();
  }, 0);
};
