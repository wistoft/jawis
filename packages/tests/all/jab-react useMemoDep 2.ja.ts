import { TestProvision } from "^jarun";

import { renderHookImproved } from "^jawis-mess/node";
import { useMemoDep } from "^jab-react";

// property key is seen.

export default (prov: TestProvision) => {
  let i = 0;
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  const func = (deps: { i?: string; j?: string }) => ++i;

  const { result, rerender } = renderHookImproved(
    useMemoDep,
    { i: "hej" },
    func
  );

  prov.eq(1, result);

  //new key cause rerender.

  prov.eq(2, rerender({ j: "hej" }, func));
};
