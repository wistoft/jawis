import { TestProvision } from "^jarun";

import { safeAll } from "^yapu";
import { youWaitedForMe } from "../_fixture";

//simple promises

export default (prov: TestProvision) => ({
  noPromises: safeAll([], prov.onError),
  resPromises: safeAll([youWaitedForMe(prov)], prov.onError),
});
