import { TestProvision } from "^jarun";

import { wrapHook } from "^misc/node";
import { useMemoDep } from "^jab-react";

// property key is seen.

export default (prov: TestProvision) => {
  let i = 0;
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  const func = (deps: { i?: string; j?: string }) => ++i;

  const { result, hook } = wrapHook(useMemoDep, { i: "hej" }, func);

  prov.eq(1, result);

  //new key cause rerender.

  prov.eq(2, hook({ j: "hej" }, func));
};
