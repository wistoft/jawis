import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const pageSize = 32;
  const dataSize = 2;

  const heap = getSharedChunkHeap(prov, { pageSize, dataSize });

  const a1 = heap.allocate(Uint8Array);
  const a2 = heap.allocate(Uint8Array);
  const a3 = heap.allocate(Uint8Array);
  const a4 = heap.allocate(Uint8Array);

  heap.deallocate(a1.ref);
  heap.deallocate(a2.ref);
  heap.deallocate(a3.ref);
  heap.deallocate(a4.ref);

  heap.dispose();
};
