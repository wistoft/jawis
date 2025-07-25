import { TestProvision } from "^jarun";

import { assertUnsettled } from "^yapu";
import { getReusableWPPAndDeps } from "../_fixture";

//kill, before process has returned.

export default (prov: TestProvision) => {
  const [angel, deps] = getReusableWPPAndDeps(prov);

  assertUnsettled(angel.useBee(deps), prov.onError);

  return angel.noisyKill();
};
