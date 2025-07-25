import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(1, 1);
  tree.set(2, 2);
  tree.set(3, 3);
  tree.set(4, 4);
  tree.set(5, 5);
  tree.set(6, 6);

  tree.delete(1);

  //clean up

  tree.delete(2);
  tree.delete(3);
  tree.delete(4);
  tree.delete(5);
  tree.delete(6);

  tree.dispose();
};
