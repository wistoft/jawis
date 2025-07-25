import { TestProvision } from "^jarun";
import { data1, empty, getSharedDynamicMap } from "^tests/_fixture";

//empty is supported as key.

export default (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov);

  map.set(empty, empty);
  prov.eq(empty, map.get(empty));

  map.set(empty, data1);
  prov.eq(data1, map.get(empty));

  map.delete(empty);
  prov.eq(undefined, map.get(empty));

  map.dispose();
};
