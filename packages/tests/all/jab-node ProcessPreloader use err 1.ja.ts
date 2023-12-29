import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps, shutdownQuickFix } from "../_fixture";

//double use

export default (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov);

  return pp
    .useProcess(deps)
    .then((process) =>
      pp.useProcess(deps).finally(() => shutdownQuickFix(process))
    );
};
