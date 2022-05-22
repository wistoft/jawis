import { TestProvision } from "^jarun";
import { getSharedDynamicMap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov);

  map.delete(new TextEncoder().encode("dontExist"));

  map.dispose();
};
