import async_hooks from "async_hooks";

import { enable, getPromise, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//not impl - because native error extends Error not the proxy.

declare const notDefined: any;

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  const prom = getPromise<void>();
  let err: any;
  setTimeout(function outer() {
    function inner() {
      try {
        const undef = undefined as any;

        notDefined; //ReferenceErrors
        undef.sdf; //TypeError
      } catch (error) {
        err = error;
      }
      prom.resolve();
    }
    inner();
  });

  return prom.promise.then(() => {
    console.log("" + err);
    console.log(filterStackTrace(unknownToErrorData(err)));
  });
};
