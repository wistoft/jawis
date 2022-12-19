import { TestProvision } from "^jarun";

import { safeAllWait } from "^yapu";
import { youWaitedForMe } from "../_fixture";

//simple promises

export default (prov: TestProvision) => ({
  noPromises: safeAllWait([], prov.onError),
  resPromises: safeAllWait(
    [youWaitedForMe(prov), Promise.resolve("hello")],
    prov.onError
  ),
});
