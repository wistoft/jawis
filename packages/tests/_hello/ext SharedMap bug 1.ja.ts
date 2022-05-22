import { nodeRequire } from "^jab-node";
import { TestProvision } from "^jarun";

//null termination is used internally on keys.

const SharedMap = nodeRequire("E:/work/repos/SharedMap");

export default (prov: TestProvision) => {
  const map = new SharedMap(
    /* maxSize */ 4,
    /* keySize */ 4,
    /* valueSize */ 4
  );

  map.set("\x00bb", "data");

  prov.eq(undefined, map.get("\x00bb")); //bug: this should return data.
};
