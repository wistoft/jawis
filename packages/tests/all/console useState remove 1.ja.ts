import { act } from "@testing-library/react-hooks";
import { TestProvision } from "^jarun";

import { useConsoleState } from "^console";
import { renderHook } from "^render-hook-plus";
import { makeGetIntegerSequence, getUiEntries } from "../_fixture";

export default ({ imp, eq }: TestProvision) => {
  const { result, rerender } = renderHook(() =>
    useConsoleState(makeGetIntegerSequence(), getUiEntries())
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
