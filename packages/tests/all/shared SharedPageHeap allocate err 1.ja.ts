import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//overflow

export default (prov: TestProvision) => {
  const heap = getSharedTreeHeap(prov, {
    maxSize: 1,
  });

  const alloc = heap.allocate(Uint32Array);

  try {
    heap.allocate(Uint32Array);
  } finally {
    heap.deallocate(alloc.ref);
  }
};
