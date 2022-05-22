import { TestProvision } from "^jarun";
import { getSharedPageHeap } from "^tests/_fixture";

//overflow

export default (prov: TestProvision) => {
  const heap = getSharedPageHeap(prov, {
    size: 1,
  });

  heap.allocate(Uint32Array);
  heap.allocate(Uint32Array);
};
