import { TestProvision } from "^jarun";
import { getSharedCompactBitTree } from "^tests/_fixture";

//the first free index is used

export default (prov: TestProvision) => {
  const tree = getSharedCompactBitTree(prov, { maxSize: 4 });

  const a1 = tree.tryAllocate();
  const a2 = tree.tryAllocate();
  const a3 = tree.tryAllocate();
  const a4 = tree.tryAllocate();
  tree.deallocate(a1!);
  tree.deallocate(a4!);

  prov.eq(a1! >>> 4, tree.tryAllocate()! >>> 4); //hacky test
};
