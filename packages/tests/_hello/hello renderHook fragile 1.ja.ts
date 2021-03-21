import { TestProvision } from "^jarun";

import { renderHook } from "@testing-library/react-hooks";

//buggy: error isn't thrown, until `result.current` is accessed.

export default (prov: TestProvision) => {
  const { result } = renderHook(() => {
    throw new Error("ups");
  });

  //accessing here will throw the bug.
  prov.imp(result.current);

  //otherwise this is needed
  // prov.onError(result.error);
};
