import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//async/await - promise rejection

//nearly works, but note that typescript converting to generator, when downleveling.

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = async () => {
  enable(async_hooks);

  const callback = () => new Error("asdf");

  const err = await Promise.resolve().then(callback);

  const notShown = () => {
    console.log(filterStackTrace(unknownToErrorData(err)));
  };

  notShown();
};
