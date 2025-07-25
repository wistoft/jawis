import { TestProvision } from "^jarun";
import { getSharedDynamicMap } from "^tests/_fixture";

// get non-existing key isn't a failure

export default (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov);

  prov.eq(undefined, map.get(new TextEncoder().encode("dontExist")));

  map.dispose();
};
