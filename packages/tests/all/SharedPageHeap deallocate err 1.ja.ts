import { TestProvision } from "^jarun";
import { getSharedPageHeap } from "^tests/_fixture";

//reference is invalid for `get` when deallocated.

export default (prov: TestProvision) => {
  const heap = getSharedPageHeap(prov);

  const alloc = heap.allocate(Uint8Array);
  heap.deallocate(alloc.ref);

  heap.get(alloc.ref, Uint8Array);
};
