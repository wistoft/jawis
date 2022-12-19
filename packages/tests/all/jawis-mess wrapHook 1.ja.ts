import { renderHook } from "^render-hook-plus";
import { TestProvision } from "^jarun";

//no args

export default (prov: TestProvision) => {
  const { result } = renderHook(() => 1);

  prov.eq(1, result);
};
