import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//promise resolve function isn't included any where. Because it's not part of the stack.

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  return new Promise<void>((resolve) => {
    const func = () => {
      resolve();
    };
    func();
  }).then(function callback() {
    console.log(filterStackTrace(unknownToErrorData(new Error("ups"))));
  });
};
