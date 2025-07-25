import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//cannot allocate when data size isn't a multiple of typed array.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov, { dataSize: 10 });

  try {
    heap.allocate(Uint32Array);
  } finally {
    heap.dispose();
  }
};
