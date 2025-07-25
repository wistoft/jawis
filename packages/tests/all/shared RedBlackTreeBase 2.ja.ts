import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//always inserting right-most

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  const amount = 100;

  for (let i = 0; i < amount; i++) {
    prov.eq(undefined, tree.get(i));
    tree.set(i, i);
    prov.eq(i, tree.get(i));
  }

  //delete again

  for (let i = 0; i < amount; i++) {
    prov.eq(i, tree.get(i));
    tree.delete(i);
    prov.eq(undefined, tree.get(i));
  }

  tree.dispose();
};
