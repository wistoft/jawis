import { wrapHook } from "^misc/node";
import { TestProvision } from "^jarun";

//no args

export default (prov: TestProvision) => {
  const { result } = wrapHook(() => 1);

  prov.eq(1, result);
};
