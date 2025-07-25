import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//deallocate when root is the last node.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov);

  const { ref } = heap.allocate(Int32Array);

  heap.deallocate(ref);

  heap.dispose();
};
