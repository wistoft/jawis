import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//deallocate in root when free pointer is on new page.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov, { pageSize: 32, dataSize: 4 });

  const a1 = heap.allocate(Int32Array);
  const a2 = heap.allocate(Int32Array);
  const a3 = heap.allocate(Int32Array); //must be on non-root

  heap.deallocate(a1.ref);
  heap.deallocate(a2.ref); //frees the root. Or possible the above.
  heap.deallocate(a3.ref);

  heap.dispose();
};
