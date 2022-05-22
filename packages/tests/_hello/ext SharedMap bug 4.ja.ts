import { nodeRequire } from "^jab-node";
import { TestProvision } from "^jarun";

//revealed bug. Now fixed

//deadlocks when table is full.

const SharedMap = nodeRequire("E:/work/repos/SharedMap");

export default (prov: TestProvision) => {
  const map = new SharedMap(
    /* maxSize */ 4,
    /* keySize */ 3,
    /* valueSize */ 3
  );

  map.set("abc", "123");
  map.set("def", "456");
  map.set("ghi", "789");
  map.set("jkl", "abc");

  map.set("abc", "aaa");
};
