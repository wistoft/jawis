import async_hooks from "async_hooks";

import { enable, getPromise, makeJabError, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

// Error trace request in later context. But still Retains trace from creation context.

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  const prom = getPromise<void>();
  let err: any;

  setTimeout(function outer() {
    function inner() {
      err = makeJabError("asdf");
      prom.resolve();
    }
    inner();
  });

  return prom.promise.then(() => {
    console.log(filterStackTrace(unknownToErrorData(err)));
  });
};
