import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

//always inserting left-most

export default (prov: TestProvision) => {
  const tree = getUint32RedBlackTree(prov);

  const amount = 100;

  for (let i = amount; i > 0; i--) {
    // console.log(i);
    prov.eq(undefined, tree.get(i));
    tree.set(i, i);
    prov.eq(i, tree.get(i));
  }

  //delete again

  for (let i = amount; i > 0; i--) {
    prov.eq(i, tree.get(i));
    tree.delete(i);
    prov.eq(undefined, tree.get(i));
  }
};
