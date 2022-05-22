import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

//black non-root node with one red right child

export default (prov: TestProvision) => {
  const tree = getUint32RedBlackTree(prov);

  tree.set(2, 2);
  tree.set(1, 1);
  tree.set(3, 3);
  tree.set(4, 4);

  tree.delete(3);

  prov.eq(undefined, tree.get(3));

  prov.eq(1, tree.get(1));
  prov.eq(2, tree.get(2));
  prov.eq(4, tree.get(4));

  //clean up

  tree.delete(1);
  tree.delete(2);
  tree.delete(4);
};
