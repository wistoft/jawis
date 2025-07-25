import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov);

  //first

  const a1 = heap.allocate(Uint8Array);
  const a2 = heap.allocate(Uint8Array);

  heap.deallocate(a1.ref);
  heap.deallocate(a2.ref);

  //again

  const b1 = heap.allocate(Uint8Array);

  heap.deallocate(b1.ref);

  heap.dispose();
};
