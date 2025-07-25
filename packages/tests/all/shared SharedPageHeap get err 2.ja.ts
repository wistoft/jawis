import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//reference is not allocated

export default (prov: TestProvision) => {
  const heap = getSharedTreeHeap(prov);

  heap.get(0, Uint8Array);
};
