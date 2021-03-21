import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps } from "../_fixture";

//shutdown, before process has returned.

export default (prov: TestProvision) => {
  const [angel] = getReusableWPPAndDeps(prov);

  return angel.shutdown();
};
