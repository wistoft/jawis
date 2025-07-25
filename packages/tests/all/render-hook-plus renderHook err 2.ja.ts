import { renderHook } from "^render-hook-plus";
import { TestProvision } from "^jarun";
import { filterReact } from "^tests/_fixture";

//throws in rerender

export default (prov: TestProvision) => {
  filterReact(prov);

  let first = true;
  const { result, rerender } = renderHook(() => {
    if (first) {
      first = false;
      return 1;
    } else {
      throw new Error("ups");
    }
  });

  prov.eq(1, result);

  rerender();
};
