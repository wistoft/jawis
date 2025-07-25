import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//deallocate index not allocated yet.

export default (prov: TestProvision) => {
  const tree = getSharedTreeHeap(prov, { maxSize: 3 });

  tree.deallocate(0);
};
