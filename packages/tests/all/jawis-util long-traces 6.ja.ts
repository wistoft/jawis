import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//instanceof still works for old Error.

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  const OriginalError = Error;
  const oldInstance = new Error();

  enable(async_hooks);

  const newInstance = new Error();

  console.log(filterStackTrace(unknownToErrorData(newInstance)));

  //these are all true

  console.log(oldInstance instanceof Error);
  console.log(newInstance instanceof Error);

  console.log(oldInstance instanceof OriginalError);
  console.log(newInstance instanceof OriginalError);
};
