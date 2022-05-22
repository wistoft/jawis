import { TestProvision } from "^jarun";
import { getSharedPageHeap } from "^tests/_fixture";

//get returns array by reference.

export default (prov: TestProvision) => {
  const heap = getSharedPageHeap(prov);

  const alloc = heap.allocate(Uint8Array);
  alloc.array[0] = 100;

  const array2 = heap.get(alloc.ref, Uint8Array);

  prov.eq(100, array2[0]);
};
