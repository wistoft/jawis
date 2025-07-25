import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//parent is red, sibling is black.

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(2, 2);
  tree.set(1, 1);
  tree.set(3, 3);

  //turn root red

  tree.set(4, 4);
  tree.delete(4);

  //do it

  tree.delete(3);

  prov.eq(undefined, tree.get(3));

  prov.eq(1, tree.get(1));
  prov.eq(2, tree.get(2));

  //clean up

  tree.delete(1);
  tree.delete(2);

  tree.dispose();
};
