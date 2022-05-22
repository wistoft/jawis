import { TestProvision } from "^jarun";
import { getSharedCompactBitTree } from "^tests/_fixture";

export default (prov: TestProvision) => {
  for (let size = 1; size < 50; size++) {
    const tree = getSharedCompactBitTree(prov, { maxSize: size });

    const refs: (number | undefined)[] = [];

    for (let i = 0; i < size; i++) {
      refs.push(tree.tryAllocate());
    }

    // deallocate

    for (const ref of refs) {
      tree.deallocate(ref!);
    }

    for (let i = 0; i < size; i++) {}
  }
};
