import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//out of bounds

export default (prov: TestProvision) => {
  const tree = getSharedTreeHeap(prov, { maxSize: 3 });

  tree.deallocate(-1);
};
