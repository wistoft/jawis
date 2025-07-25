import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//deallocate in non-root when free pointer is on new page.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov, { pageSize: 32, dataSize: 4 });

  const a1 = heap.allocate(Int32Array);
  const a2 = heap.allocate(Int32Array);
  const a3 = heap.allocate(Int32Array); //must be on non-root
  const a4 = heap.allocate(Int32Array);
  const a5 = heap.allocate(Int32Array); //must be new page.

  heap.deallocate(a3.ref);
  heap.deallocate(a4.ref); //frees the non-root.

  //free rest

  heap.deallocate(a1.ref);
  heap.deallocate(a2.ref);
  heap.deallocate(a5.ref);

  heap.dispose();
};
