import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps } from "../_fixture";

//double use is fine, when the old has returned.

export default (prov: TestProvision) => {
  const [angel, deps] = getReusableWPPAndDeps(prov);

  return angel.useBee(deps).then((proc1) =>
    angel
      .useBee(deps)
      .then((proc2) => proc2.shutdown())
      .finally(() => proc1.shutdown())
      .finally(() => angel.shutdown())
  );
};
