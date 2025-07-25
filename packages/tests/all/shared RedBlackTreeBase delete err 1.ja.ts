import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//node must exist when deleting

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);
  try {
    tree.delete(1);
  } finally {
    tree.dispose();
  }
};
