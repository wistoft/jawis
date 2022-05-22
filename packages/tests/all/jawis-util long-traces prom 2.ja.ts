import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//promise created in promise

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  function inner() {
    const last = () => {
      console.log(filterStackTrace(unknownToErrorData(new Error())));
    };

    last();
  }

  return Promise.resolve().then(function outer() {
    return Promise.resolve().then(inner);
  });
};
