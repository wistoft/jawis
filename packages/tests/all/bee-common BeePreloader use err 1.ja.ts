import { TestProvision } from "^jarun";

import { getJabBeePreloaderAndDeps } from "../_fixture";

//double use

export default (prov: TestProvision) => {
  const [pp, deps] = getJabBeePreloaderAndDeps(prov);

  return pp
    .useBee(deps)
    .then((process) => pp.useBee(deps).finally(process.shutdown));
};
