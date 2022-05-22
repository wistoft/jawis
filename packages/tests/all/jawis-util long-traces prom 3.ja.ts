import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//promise rejection

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  return Promise.resolve()
    .then(callback)
    .catch((err) => {
      console.log(filterStackTrace(unknownToErrorData(err)));
    });
};

// external to get function display name.
const callback = () => {
  const inner = () => {
    throw new Error("asdf");
  };
  inner();
};
