import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//deallocate twice

export default (prov: TestProvision) => {
  const heap = getSharedTreeHeap(prov);

  const alloc = heap.allocate(Uint8Array);

  heap.deallocate(alloc.ref);
  heap.deallocate(alloc.ref);
};
