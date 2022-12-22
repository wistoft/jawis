import { act } from "@testing-library/react-hooks";
import { TestProvision } from "^jarun";

import { useConsoleState } from "^console";
import { renderHook } from "^render-hook-plus";
import { makeGetRandomInteger, uiEntries } from "../_fixture";

//

export default ({ imp, eq }: TestProvision) => {
  const { result, rerender } = renderHook(() =>
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
