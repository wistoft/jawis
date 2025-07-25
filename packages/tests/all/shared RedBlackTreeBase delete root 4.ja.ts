import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//black root with two red children.

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(2, 2);
  tree.set(1, 1);
  tree.set(3, 3);

  tree.delete(2);

  prov.eq(undefined, tree.get(2));

  prov.eq(1, tree.get(1));
  prov.eq(3, tree.get(3));

  //clean up

  tree.delete(1);
  tree.delete(3);

  tree.dispose();
};
