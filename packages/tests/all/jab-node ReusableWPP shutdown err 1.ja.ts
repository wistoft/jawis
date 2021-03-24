import { TestProvision } from "^jarun";

import { getReusableWPPAndDeps } from "../_fixture";

//double shutdown

export default (prov: TestProvision) => {
  const [angel] = getReusableWPPAndDeps(prov);

  const p1 = angel.shutdown();
  const p2 = angel.shutdown();

  return [p1, p2];
};
