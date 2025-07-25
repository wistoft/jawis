import { TestProvision } from "^jarun";

import { getJabBeePreloaderAndDeps } from "../_fixture";

export default (prov: TestProvision) => {
  const [pp, deps] = getJabBeePreloaderAndDeps(prov);

  return pp.useBee(deps).then((process) => process.shutdown());
};
