import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//reference is invalid for `get` when deallocated.

export default (prov: TestProvision) => {
  const heap = getSharedTreeHeap(prov);

  const alloc = heap.allocate(Uint8Array);
  heap.deallocate(alloc.ref);

  heap.get(alloc.ref, Uint8Array);
};
