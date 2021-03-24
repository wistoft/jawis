import { TestProvision } from "^jarun";

import { renderHookImproved } from "^jawis-mess/node";
import { useMemoDep } from "^jab-react";

export default (prov: TestProvision) => {
  let i = 0;
  const func = () => ++i;

  const { result, rerender } = renderHookImproved(
    useMemoDep,
    { a: "hej" },
    func
  );

  prov.eq(1, result);

  //same reference, so reuse

  prov.eq(1, rerender());

  //same value, so reuse

  prov.eq(1, rerender({ a: "hej" }, func));

  //new deps, so create new value

  prov.eq(2, rerender({ a: "dav" }, func));

  //new function doesn't cause rerender

  prov.eq(
    2,
    rerender({ a: "dav" }, () => 100)
  );
};
