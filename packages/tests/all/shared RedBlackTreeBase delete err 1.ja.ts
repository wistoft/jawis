import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

//node must exist when delting

export default (prov: TestProvision) => {
  const tree = getUint32RedBlackTree(prov);
  tree.delete(1);
};
