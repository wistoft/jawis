import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//delete in reverse order

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(1, 1);
  tree.set(2, 2);
  tree.set(3, 3);
  tree.set(4, 4);

  tree.delete(4);
  prov.eq(undefined, tree.get(4));

  tree.delete(3);
  prov.eq(undefined, tree.get(3));

  tree.delete(2);
  prov.eq(undefined, tree.get(2));

  tree.delete(1);
  prov.eq(undefined, tree.get(1));

  tree.dispose();
};
