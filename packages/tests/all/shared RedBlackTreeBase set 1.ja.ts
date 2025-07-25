import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//replace a value

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(1, 1);
  prov.eq(1, tree.get(1));

  tree.set(1, 2);
  prov.eq(2, tree.get(1));

  //clean up

  tree.delete(1);

  tree.dispose();
};
