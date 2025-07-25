import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(1, 1);
  prov.eq(1, tree.get(1));

  tree.set(2, 2);
  prov.eq(2, tree.get(2));

  tree.delete(1);
  prov.eq(undefined, tree.get(1));

  tree.delete(2);
  prov.eq(undefined, tree.get(2));

  tree.dispose();
};
