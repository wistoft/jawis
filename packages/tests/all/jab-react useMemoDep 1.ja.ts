import { TestProvision } from "^jarun";

import { wrapHook } from "^misc/node";
import { useMemoDep } from "^jab-react";

export default (prov: TestProvision) => {
  let i = 0;
  const func = () => ++i;

  const { result, hook, rerender } = wrapHook(useMemoDep, { a: "hej" }, func);

  prov.eq(1, result);

  //same reference, so reuse

  prov.eq(1, rerender());

  //same value, so reuse

  prov.eq(1, hook({ a: "hej" }, func));

  //new deps, so create new value

  prov.eq(2, hook({ a: "dav" }, func));

  //new function doesn't cause rerender

  prov.eq(
    2,
    hook({ a: "dav" }, () => 100)
  );
};
