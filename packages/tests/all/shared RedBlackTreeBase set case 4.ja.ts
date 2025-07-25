import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//case 4

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(1, 1);
  tree.set(2, 2); //hits case 4

  prov.eq(1, tree.get(1));
  prov.eq(2, tree.get(2));

  //clean up

  tree.delete(1);
  tree.delete(2);

  tree.dispose();
};
