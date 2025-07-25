import { TestProvision } from "^jarun";
import { getUint32TreeSet } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const tree = getUint32TreeSet(prov);

  tree.add(1);
  prov.chk(tree.has(1));

  tree.add(2);
  prov.chk(tree.has(2));

  tree.delete(1);
  prov.chk(!tree.has(1));

  tree.delete(2);
  prov.chk(!tree.has(2));

  tree.dispose();
};
