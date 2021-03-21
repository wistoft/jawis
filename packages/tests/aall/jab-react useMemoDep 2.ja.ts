import { TestProvision } from "^jarun";

import { ScriptStatus } from "^jagoc";
import { renderUseJagoDirector } from "^tests/_fixture";
import { renderHookImproved } from "^jawis-mess/node";
import { useMemoDep } from "^jab-react";

// property key is seen.

export default (prov: TestProvision) => {
  let i = 0;
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
