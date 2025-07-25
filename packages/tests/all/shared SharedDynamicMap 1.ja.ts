import { TestProvision } from "^jarun";
import { data1, empty, getSharedDynamicMap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov);

  //one element

  map.set(data1, data1);
  prov.eq(undefined, map.get(new TextEncoder().encode("dontExist")));
  prov.eq(data1, map.get(data1));

  //replace element

  map.set(data1, empty);
  prov.eq(empty, map.get(data1));

  //delete

  map.delete(data1);

  prov.eq(undefined, map.get(data1));

  map.dispose();
};
