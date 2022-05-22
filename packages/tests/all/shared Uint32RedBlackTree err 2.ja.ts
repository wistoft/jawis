import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

//floating point keys isn't supported.

export default (prov: TestProvision) => {
  const tree = getUint32RedBlackTree(prov);

  tree.set(1.2, 1);
};
