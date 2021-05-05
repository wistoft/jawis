import { TestProvision } from "^jarun";

import { act } from "@testing-library/react-hooks";
import { useConsoleState } from "^console";
import { makeGetRandomInteger, uiEntries } from "../_fixture";
import { renderHookImproved } from "^jawis-mess/node";

//

export default ({ imp, eq }: TestProvision) => {
  const { result, rerender } = renderHookImproved(() =>
    useConsoleState(makeGetRandomInteger(), uiEntries)
  );

  eq(4, result.logs.length);

  act(() => {
    result.removeEntry(2);
  });

  //

  const s1 = rerender();

  eq(3, s1.logs.length);

  act(() => {
    s1.removeEntry(4);
  });

  //

  const s2 = rerender();

  imp(s2.logs);
};
