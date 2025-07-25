import { TestProvision } from "^jarun";
import { getSharedDynamicMap } from "^tests/_fixture";

//it's not a failure to delete non-existing keys

export default (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov);

  map.delete(new TextEncoder().encode("dontExist"));

  map.dispose();
};
