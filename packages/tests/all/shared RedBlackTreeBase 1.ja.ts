import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  //empty tree

  prov.eq(undefined, tree.get(0));

  //one node

  tree.set(1, 10);

  prov.eq(undefined, tree.get(0)); //smaller than root node
  prov.eq(undefined, tree.get(10)); //larger than root node
  prov.eq(10, tree.get(1));

  //two nodes

  tree.set(2, 20);

  prov.eq(undefined, tree.get(0)); //smaller than root node
  prov.eq(undefined, tree.get(20)); //larger than root node
  prov.eq(10, tree.get(1));

  //one node again

  tree.delete(2);

  prov.eq(undefined, tree.get(2)); //deleted
  prov.eq(10, tree.get(1));

  //empty

  tree.delete(1);
  prov.eq(undefined, tree.get(1));

  tree.dispose();
};
