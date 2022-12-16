import { renderHook } from "^render-hook";
import { TestProvision } from "^jarun";

//throws in first render

export default (prov: TestProvision) => {
  renderHook(() => {
    throw new Error("ups");
  });
};
