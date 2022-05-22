import { TestProvision } from "^jarun";
import { getSharedPageHeap } from "^tests/_fixture";

//deallocate twice

export default (prov: TestProvision) => {
  const heap = getSharedPageHeap(prov);

  const alloc = heap.allocate(Uint8Array);

  heap.deallocate(alloc.ref);
  heap.deallocate(alloc.ref);
};
