import { TestProvision } from "^jarun";

import { act } from "@testing-library/react-hooks";
import { useConsoleState } from "^console";
import { makeGetRandomInteger, uiEntries } from "../_fixture";
import { wrapHook } from "^misc/node";

//

export default ({ imp }: TestProvision) => {
  const { result, rerender } = wrapHook(() =>
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
