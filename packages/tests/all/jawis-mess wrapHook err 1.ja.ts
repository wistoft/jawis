import { wrapHook } from "^misc/node";
import { TestProvision } from "^jarun";

//throws in first render

export default (prov: TestProvision) => {
  wrapHook(() => {
    throw new Error("ups");
  });
};
