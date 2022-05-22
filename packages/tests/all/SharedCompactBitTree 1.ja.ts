import { TestProvision } from "^jarun";
import { getSharedCompactBitTree } from "^tests/_fixture";

export default (prov: TestProvision) => {
  let tree;

  tree = getSharedCompactBitTree(prov, { maxSize: 1 });

  const a = tree.tryAllocate();

  prov.eq(undefined, tree.tryAllocate());

  tree.deallocate(a!);
};
