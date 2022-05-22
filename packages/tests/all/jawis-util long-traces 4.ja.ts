import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

// Error trace requested in child context. But trace still reflects parent context.

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  setTimeout(() => {
    const err = new Error("asdf");

    setTimeout(() => {
      console.log(filterStackTrace(unknownToErrorData(err)));
    });
  });
};
