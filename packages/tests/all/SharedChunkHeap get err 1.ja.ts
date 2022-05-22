import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//get non-existing chunk

export default (prov: TestProvision) => {
  const heap = getSharedChunkHeap(prov);

  heap.get(4096 << 8, Int32Array);
};
