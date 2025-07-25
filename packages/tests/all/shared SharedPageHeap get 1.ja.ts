import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//get returns array by reference.

export default (prov: TestProvision) => {
  const heap = getSharedTreeHeap(prov);

  const alloc = heap.allocate(Uint8Array);
  alloc.array[0] = 100;

  const array2 = heap.get(alloc.ref, Uint8Array);

  prov.eq(100, array2[0]);

  heap.deallocate(alloc.ref);
};
