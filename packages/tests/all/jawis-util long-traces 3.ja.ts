import fs from "fs";
import async_hooks from "async_hooks";

import { enable, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { makeLiveJacs_lazy, filterStackTrace } from "../_fixture";

//native async callbacks.

export default (prov: TestProvision) => makeLiveJacs_lazy(prov, __filename);

export const main = () => {
  enable(async_hooks);

  const outer = () => {
    fs.stat("asdf", function inner() {
      const last = () => {
        console.log(filterStackTrace(unknownToErrorData(new Error())));
      };

      last();
    });
  };

  outer();
};
