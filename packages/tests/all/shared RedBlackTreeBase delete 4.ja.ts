import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(1, 1);
  tree.set(2, 2);
  tree.set(3, 3);
  tree.set(8, 8);
  tree.set(4, 4);
  tree.set(10, 10);
  tree.set(9, 9);
  tree.set(5, 5);
  tree.set(7, 7);
  tree.set(6, 6);

  tree.delete(1);
  tree.delete(2);
  tree.delete(3);
  tree.delete(8);

  prov.eq(4, tree.get(4));
  prov.eq(5, tree.get(5));
  prov.eq(6, tree.get(6));
  prov.eq(7, tree.get(7));
  prov.eq(9, tree.get(9));
  prov.eq(10, tree.get(10));

  //clean up

  tree.delete(4);
  tree.delete(5);
  tree.delete(6);
  tree.delete(7);
  tree.delete(9);
  tree.delete(10);

  tree.dispose();
};
