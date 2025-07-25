import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//array is zero filled.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov);

  const { ref, array } = heap.allocate(Int32Array);

  //old data

  array.fill(10);

  heap.deallocate(ref);

  //reallocated

  const { ref: ref2, array: array2 } = heap.allocate(Int32Array);

  prov.chk(array2.every((val) => val === 0));

  heap.deallocate(ref2);

  heap.dispose();
};
