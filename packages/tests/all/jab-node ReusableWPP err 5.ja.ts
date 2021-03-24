import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps } from "../_fixture";

export default (prov: TestProvision) => {
  const [angel, deps] = getReusableWPPAndDeps(prov, { filename: 144 as any });

  return angel.useProcess(deps);
};
