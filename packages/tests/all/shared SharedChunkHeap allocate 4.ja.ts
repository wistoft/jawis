import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//big int array is zero filled.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov);

  const { ref, array } = heap.allocate(BigInt64Array);

  //old data

  array.fill(BigInt(10));

  heap.deallocate(ref);

  //reallocated

  const { ref: ref2, array: array2 } = heap.allocate(BigInt64Array);

  prov.chk(array2.every((val) => val === BigInt(0)));

  heap.deallocate(ref2);

  heap.dispose();
};
