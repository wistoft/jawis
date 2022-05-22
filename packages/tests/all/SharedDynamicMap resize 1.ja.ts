import { TestProvision } from "^jarun";
import { data1, data2, getSharedDynamicMap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov);

  map.set(data1, data2);

  map.resize(4);

  //clean up

  map.delete(data1);
};
