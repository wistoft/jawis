import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//arrays are zero filled.

export default (prov: TestProvision) => {
  const heap = getSharedTreeHeap(prov);

  const alloc = heap.allocate(BigInt64Array);
  const alloc2 = heap.allocate(Uint8Array);
  alloc.array[0] = BigInt(100);
  alloc2.array[0] = 100;

  heap.deallocate(alloc.ref);
  heap.deallocate(alloc2.ref);

  //reallocate

  const new_alloc = heap.allocate(BigInt64Array);
  const new_alloc2 = heap.allocate(Uint8Array);

  //must be same chuck for test to make sense.

  prov.eq(new_alloc.ref >>> 4, alloc.ref >>> 4);
  prov.eq(new_alloc2.ref >>> 4, alloc2.ref >>> 4);

  //verify zero filled

  prov.chk(new_alloc.array.every((val) => val === BigInt(0)));
  prov.chk(new_alloc2.array.every((val) => val === 0));

  heap.deallocate(new_alloc.ref);
  heap.deallocate(new_alloc2.ref);
};
