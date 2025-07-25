import { act } from "@testing-library/react-hooks";
import { TestProvision } from "^jarun";

import { useConsoleState } from "^console";
import { renderHook } from "^render-hook-plus";
import { makeGetIntegerSequence } from "../_fixture";

//simple sync add

export default (prov: TestProvision) => {
  const { result, rerender } = renderHook(() =>
    useConsoleState(makeGetIntegerSequence(), [])
  );

  act(() => {
    result.addData([
      { type: "log", context: "browser", logName: "myLog", data: ["dav"] },
    ]);
  });

  prov.imp(rerender().logs);
};
