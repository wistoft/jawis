import { renderHook } from "^render-hook-plus";
import { TestProvision } from "^jarun";
import { filterReact } from "^tests/_fixture";

//throws in first render

export default (prov: TestProvision) => {
  filterReact(prov);

  renderHook(() => {
    throw new Error("ups");
  });
};
