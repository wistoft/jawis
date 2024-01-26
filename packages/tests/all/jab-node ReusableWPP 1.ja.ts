import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps, shutdownQuickFix } from "../_fixture";

//double use is fine, when the old has returned.

export default (prov: TestProvision) => {
  const [angel, deps] = getReusableWPPAndDeps(prov);

  return angel.useProcess(deps).then((proc1) =>
    angel
      .useProcess(deps)
      .then((proc2) => shutdownQuickFix(proc2))
      .finally(() => shutdownQuickFix(proc1))
      .finally(() => shutdownQuickFix(angel))
  );
};
