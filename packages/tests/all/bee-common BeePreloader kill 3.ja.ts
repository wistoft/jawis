import { TestProvision } from "^jarun";

import { assertUnsettled } from "^yapu";
import { getJabBeePreloaderAndDeps } from "../_fixture";

//kill while using

export default (prov: TestProvision) => {
  const [pp, deps] = getJabBeePreloaderAndDeps(prov);

  assertUnsettled(pp.useBee(deps), prov.onError);

  return pp.kill();
};
