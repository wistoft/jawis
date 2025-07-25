import { TestProvision } from "^jarun";
import { getUint32TreeSet } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const tree = getUint32TreeSet(prov);

  tree.add(1);
  tree.add(3);
  tree.add(2);

  for (const val of tree) {
    console.log(val);
  }

  tree.delete(1);
  tree.delete(2);
  tree.delete(3);

  tree.dispose();
};
