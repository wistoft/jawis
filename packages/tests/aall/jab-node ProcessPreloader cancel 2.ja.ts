import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps } from "../_fixture";

// user is rejected, when cancelled.

export default (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov);

  const p1 = pp.useProcess(deps);

  pp.cancel();

  return p1.then(() => prov.imp("unreach")).finally(pp.kill);
};
