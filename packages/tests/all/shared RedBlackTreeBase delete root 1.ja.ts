import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

//delete root node with no children

export default (prov: TestProvision) => {
  const tree = getUint32RedBlackTree(prov);
  tree.set(1, 10);

  tree.delete(1);

  prov.eq(undefined, tree.get(1));
};
