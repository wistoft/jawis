import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

//delete root node with right child.

export default (prov: TestProvision) => {
  const tree = getUint32RedBlackTree(prov);
  tree.set(1, 1);
  tree.set(2, 2);

  tree.delete(1);

  prov.eq(undefined, tree.get(1));

  prov.eq(2, tree.get(2));

  //clean up

  tree.delete(2);
};
