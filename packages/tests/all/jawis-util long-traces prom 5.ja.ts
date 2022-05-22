import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//promise reject function gets stack trace from its own context.

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  return new Promise<void>(function executor(resolve, reject) {
    const inner = () => {
      reject(new Error("asdf"));
    };
    inner();
  }).catch((err) => {
    console.log(filterStackTrace(unknownToErrorData(err)));
  });
};
