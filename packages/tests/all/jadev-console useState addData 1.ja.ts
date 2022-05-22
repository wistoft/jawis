import { TestProvision } from "^jarun";

import { act } from "@testing-library/react-hooks";
import { useConsoleState } from "^console";
import { makeGetIntegerSequence } from "../_fixture";
import { wrapHook } from "^misc/node";

//simple sync add

export default (prov: TestProvision) => {
  const { result, rerender } = wrapHook(() =>
    useConsoleState(makeGetIntegerSequence(), [])
  );

  act(() => {
    result.addData([
      { type: "log", context: "browser", logName: "myLog", data: ["dav"] },
    ]);
  });

  prov.imp(rerender().logs);
};
