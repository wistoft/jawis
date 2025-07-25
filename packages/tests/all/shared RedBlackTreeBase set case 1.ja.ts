import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//case 1

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(2, 2); //root initially red
  tree.set(1, 1); //root is now turned black.
  tree.set(3, 3); //hits case 1.

  prov.eq(1, tree.get(1));
  prov.eq(2, tree.get(2));
  prov.eq(3, tree.get(3));

  //clean up

  tree.delete(1);
  tree.delete(2);
  tree.delete(3);

  tree.dispose();
};
