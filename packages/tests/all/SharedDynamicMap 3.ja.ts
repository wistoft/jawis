import { TestProvision } from "^jarun";
import { data1, getSharedDynamicMap } from "^tests/_fixture";

//can handle large reference numbers.

export default (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov);

  (map as any).heap.refMax = 1e7 - 1; //maybe we need larger.

  //set/get

  map.set(data1, data1);
  prov.eq(data1, map.get(data1));

  //delete

  map.delete(data1);

  prov.eq(null, map.get(data1));

  map.dispose();
};
