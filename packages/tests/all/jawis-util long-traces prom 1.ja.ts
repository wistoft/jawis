import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//single promise

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  let prom!: Promise<void>;

  const first = () => {
    prom = Promise.resolve();
  };

  first();

  return prom.then(function callback() {
    const inner = () => {
      console.log(filterStackTrace(unknownToErrorData(new Error())));
    };

    inner();
  });
};
