import { act } from "@testing-library/react-hooks";
import { TestProvision } from "^jarun";

import { useConsoleState } from "^console";
import { renderHook } from "^render-hook-plus";
import { makeGetRandomInteger, uiEntries } from "../_fixture";

//

export default ({ imp }: TestProvision) => {
  const { result, rerender } = renderHook(() =>
    useConsoleState(makeGetRandomInteger(), uiEntries)
  );

  //nothing set at first
  imp(result.logs.map(({ expandEntry }) => expandEntry));

  act(() => {
    result.onToggleEntry(4);
  });

  //

  const s1 = rerender();

  imp(s1.logs.map(({ expandEntry }) => expandEntry));

  act(() => {
    s1.onToggleEntry(4);
  });

  //

  const s2 = rerender();

  imp(s2.logs.map(({ expandEntry }) => expandEntry));

  act(() => {
    s2.onToggleEntry(1);
  });

  //

  const s3 = rerender();

  imp(s3.logs.map(({ expandEntry }) => expandEntry));
};
