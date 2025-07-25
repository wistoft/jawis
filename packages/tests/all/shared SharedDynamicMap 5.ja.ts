import { TestProvision } from "^jarun";
import { data1, data2, empty, getSharedDynamicMap } from "^tests/_fixture";

// works with poor hash function.

export default (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov, {
    hashFunction: () => 0,
  });

  //one element

  map.set(data1, data1);
  map.set(data2, empty);

  prov.eq(data1, map.get(data1));
  prov.eq(empty, map.get(data2));

  map.delete(data1);
  prov.eq(undefined, map.get(data1));

  map.delete(data2);
  prov.eq(undefined, map.get(data2));

  map.dispose();
};
