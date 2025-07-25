import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//malformed ref

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov);

  const alloc = heap.allocate(Int32Array);

  try {
    heap.get(alloc.ref + 200, Int32Array);
  } finally {
    heap.deallocate(alloc.ref);
    heap.dispose();
  }
};
