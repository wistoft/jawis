import { nodeRequire } from "^jab-node";
import { TestProvision } from "^jarun";

//null termination is used internally on values.

const SharedMap = nodeRequire("E:/work/repos/SharedMap");

export default (prov: TestProvision) => {
  const map = new SharedMap(
    /* maxSize */ 4,
    /* keySize */ 4,
    /* valueSize */ 4
  );

  map.set("key", "a\x00b");

  prov.eq("a", map.get("key")); //bug: returns wrong data.
};
