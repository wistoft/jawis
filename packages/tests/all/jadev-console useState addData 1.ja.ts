import { TestProvision } from "^jarun";

import { act } from "@testing-library/react-hooks";
import { useConsoleState } from "^console";
import { makeGetRandomInteger } from "../_fixture";
import { renderHook } from "^render-hook";

//simple sync add

export default (prov: TestProvision) => {
  const { result, rerender } = renderHook(() =>
    useConsoleState(makeGetRandomInteger(), [])
  );

  act(() => {
    result.addData([
      { type: "log", context: "browser", logName: "myLog", data: ["dav"] },
    ]);
  });

  prov.imp(rerender().logs);
};
