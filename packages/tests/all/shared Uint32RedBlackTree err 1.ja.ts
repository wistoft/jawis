import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//negative keys aren't supported

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  try {
    tree.set(-1, 1);
  } finally {
    tree.dispose();
  }
};
