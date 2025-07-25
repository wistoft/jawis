import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//replace a value

export default (prov: TestProvision) => {
  const tree = getUint32TreeMap(prov);

  tree.set(11, 111);
  tree.set(33, 333);
  tree.set(22, 222);

  for (const node of tree) {
    console.log(node);
  }

  //clean up

  tree.delete(11);
  tree.delete(22);
  tree.delete(33);

  tree.dispose();
};
