import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

//red non-root node without children

export default (prov: TestProvision) => {
  const tree = getUint32RedBlackTree(prov);

  tree.set(1, 1);
  tree.set(2, 2);

  tree.delete(2);

  prov.eq(undefined, tree.get(2));

  prov.eq(1, tree.get(1));

  //clean up

  tree.delete(1);
};
