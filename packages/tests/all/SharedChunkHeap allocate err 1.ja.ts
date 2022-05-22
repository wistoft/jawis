import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//cannot allocate when data size isn't a multiple of typed array.

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov, { dataSize: 10 });

  const a2 = heap.allocate(Uint32Array);
};
