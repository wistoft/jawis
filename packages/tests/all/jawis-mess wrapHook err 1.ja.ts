import { renderHook } from "^render-hook-plus";
import { TestProvision } from "^jarun";

//throws in first render

export default (prov: TestProvision) => {
  renderHook(() => {
    throw new Error("ups");
  });
};
