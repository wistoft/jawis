import { TestProvision } from "^jarun";
import { getSharedPageHeap } from "^tests/_fixture";

//reference is not allocated

export default (prov: TestProvision) => {
  const heap = getSharedPageHeap(prov);

  heap.get(0, Uint8Array);
};
