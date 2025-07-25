import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//reference is out of bounds

export default (prov: TestProvision) => {
  const heap = getSharedTreeHeap(prov);

  heap.get(1000, Uint8Array);
};
