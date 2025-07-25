import { TestProvision } from "^jarun";
import { getSharedTreeHeap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const tree = getSharedTreeHeap(prov, { maxSize: 1 });

  const a = tree.tryAllocate();

  prov.eq(undefined, tree.tryAllocate());

  tree.deallocate(a!);
};
