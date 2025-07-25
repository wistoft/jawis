import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

//index outside max size.

export default (prov: TestProvision) => {
  const tree = getSharedTreeHeap(prov, { maxSize: 3 });

  tree.deallocate(10);
};
