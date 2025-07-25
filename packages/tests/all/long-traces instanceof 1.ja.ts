import async_hooks from "node:async_hooks";
import { assert } from "^jab";
import { enable } from "^long-traces";
import { TestProvision } from "^jarun";

import { runLiveJacsBee_lazy } from "../_fixture";

//instanceof still works for old Error.

export default (prov: TestProvision) => runLiveJacsBee_lazy(prov, __filename);

export const main = () => {
  const OriginalError = Error;
  const oldInstance = new Error();

  enable(async_hooks);

  const newInstance = new Error();

  //these are all true

  assert(Error !== OriginalError);

  assert(oldInstance instanceof Error);
  assert(newInstance instanceof Error);

  assert(oldInstance instanceof OriginalError);
  assert(newInstance instanceof OriginalError);
};
