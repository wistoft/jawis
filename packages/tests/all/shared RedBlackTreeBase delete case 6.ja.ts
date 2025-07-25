import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//case 6

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(1, 1);
  tree.set(2, 2);
  tree.set(3, 3);
  tree.set(4, 4);

  tree.delete(1);

  prov.eq(undefined, tree.get(1));

  prov.eq(2, tree.get(2));
  prov.eq(3, tree.get(3));
  prov.eq(4, tree.get(4));

  //clean up

  tree.delete(2);
  tree.delete(3);
  tree.delete(4);

  tree.dispose();
};
