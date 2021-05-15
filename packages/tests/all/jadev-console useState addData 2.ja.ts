import { TestProvision } from "^jarun";

import { act } from "@testing-library/react-hooks";
import { useConsoleState } from "^console";
import { errorData2, makeGetRandomInteger } from "../_fixture";
import { wrapHook } from "^misc/node";

// source map the error log, so state update will be async.

export default (prov: TestProvision) => {
  const { result, rerender } = wrapHook(() =>
    useConsoleState(makeGetRandomInteger(), [])
  );

  let prom: any;

  act(() => {
    prom = result.addData(
      [{ type: "error", context: "browser", data: errorData2 }],
      true
    );
  });

  prov.imp(rerender().logs); //here there's no stack trace.

  return prom.then(() => {
    prov.imp(rerender().logs); //now there is.
  });
};
