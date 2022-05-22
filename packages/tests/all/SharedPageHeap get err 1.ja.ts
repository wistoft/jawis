import { TestProvision } from "^jarun";
import { getSharedPageHeap } from "^tests/_fixture";

//reference is out of bounds

export default (prov: TestProvision) => {
  const heap = getSharedPageHeap(prov);

  heap.get(1000, Uint8Array);
};
