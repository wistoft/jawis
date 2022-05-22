import { nodeRequire } from "^jab-node";
import { TestProvision } from "^jarun";

const SharedMap = nodeRequire("E:/work/repos/SharedMap");

//revealed bug. Now fixed

// there wasn't space for zero byte in valuesData

export default (prov: TestProvision) => {
  const map = new SharedMap(
    /* maxSize */ 4,
    /* keySize */ 4,
    /* valueSize */ 4
  );

  const data = "2345";

  map.set("var0", data);
  map.set("var1", data);
  map.set("var2", data);

  prov.eq(data, map.get("var0"));
  prov.eq(data, map.get("var1"));
  prov.eq(data, map.get("var2"));
};
