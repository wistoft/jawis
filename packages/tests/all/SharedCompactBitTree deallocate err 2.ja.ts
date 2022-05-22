import { TestProvision } from "^jarun";
import { getSharedCompactBitTree } from "^tests/_fixture";

//index out side max size.

export default (prov: TestProvision) => {
  const tree = getSharedCompactBitTree(prov, { maxSize: 3 });

  tree.deallocate(10);
};
