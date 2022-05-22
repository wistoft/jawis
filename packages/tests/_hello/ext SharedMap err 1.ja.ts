import { nodeRequire } from "^jab-node";
import { TestProvision } from "^jarun";

//fill shared map up.

const SharedMap = nodeRequire("E:/work/repos/SharedMap");

export default (prov: TestProvision) => {
  const map = new SharedMap(
    /* maxSize */ 4,
    /* keySize */ 4,
    /* valueSize */ 4
  );

  for (let i = 0; 2 * 1000; i++) {
    map.set("" + i, 0);
  }
};
