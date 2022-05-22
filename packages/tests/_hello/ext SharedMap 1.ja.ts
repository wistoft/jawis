import { nodeRequire } from "^jab-node";
import { TestProvision } from "^jarun";

const SharedMap = nodeRequire("E:/work/repos/SharedMap");

export default (prov: TestProvision) => {
  const map = new SharedMap(
    /* maxSize */ 4,
    /* keySize */ 4,
    /* valueSize */ 4
  );

  map.set("key", "data");

  prov.eq("data", map.get("key"));
};
