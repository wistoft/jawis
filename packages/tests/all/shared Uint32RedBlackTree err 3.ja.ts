import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//floating point values isn't supported.

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  try {
    tree.set(1, 1.2);
  } finally {
    tree.dispose();
  }
};
