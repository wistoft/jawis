import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps } from "../_fixture";

export default (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov);

  return pp.useProcess(deps).then((process) => process.shutdown());
};
