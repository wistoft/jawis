import { TestProvision } from "^jarun";
import { getSharedCompactBitTree } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const tree = getSharedCompactBitTree(prov, { maxSize: 1 });
  tree.getDataIndex(0);
};
