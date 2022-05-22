import { TestProvision } from "^jarun";
import { getSharedCompactBitTree } from "^tests/_fixture";

//out of bounds

export default (prov: TestProvision) => {
  const tree = getSharedCompactBitTree(prov, { maxSize: 3 });

  tree.deallocate(-1);
};
