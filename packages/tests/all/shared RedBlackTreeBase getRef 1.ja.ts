import { TestProvision } from "^jarun";
import { getUint32TreeSet } from "^tests/_fixture";
import { assertEq } from "^jab";
import { Uint32TreeSet } from "^shared-tree";

export default (prov: TestProvision) => {
  const tree1 = getUint32TreeSet(prov);
  const tree2 = Uint32TreeSet.fromRef(tree1.deps, tree1.getRef());

  //check both have the value

  tree1.add(345);

  assertEq(tree1.size, 1);
  assertEq(tree2.size, 1);

  //check both have the value

  tree1.delete(345);

  assertEq(tree1.size, 0);
  assertEq(tree2.size, 0);

  tree1.dispose();
};
