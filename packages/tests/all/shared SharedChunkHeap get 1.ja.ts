import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//get returns array by reference.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov, { dataSize: 8 });

  const alloc = heap.allocate(Int32Array);
  alloc.array[0] = 100;

  const array2 = heap.get(alloc.ref, Int32Array);

  prov.eq(100, array2[0]);

  //clean up

  heap.deallocate(alloc.ref);

  heap.dispose();
};
