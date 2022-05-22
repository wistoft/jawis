import { TestProvision } from "^jarun";
import { getSharedCompactBitTree } from "^tests/_fixture";

//dealloacte index not allocated yet.

export default (prov: TestProvision) => {
  const tree = getSharedCompactBitTree(prov, { maxSize: 3 });

  tree.deallocate(0);
};
