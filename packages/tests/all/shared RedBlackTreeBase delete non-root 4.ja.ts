import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//black non-root node with two red child

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(2, 2);
  tree.set(1, 1);
  tree.set(3, 3);
  tree.set(5, 5);
  tree.set(4, 4);

  tree.delete(4);

  prov.eq(undefined, tree.get(4));

  prov.eq(1, tree.get(1));
  prov.eq(2, tree.get(2));
  prov.eq(3, tree.get(3));
  prov.eq(5, tree.get(5));

  //clean up

  tree.delete(1);
  tree.delete(2);
  tree.delete(3);
  tree.delete(5);

  tree.dispose();
};
