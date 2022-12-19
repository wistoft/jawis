import { TestProvision } from "^jarun";

import { nightmare, safeAllWait } from "^yapu";
import { youWaitedForMe } from "../_fixture";

//wait for all, even in case of rejection.

export default (prov: TestProvision) =>
  safeAllWait([nightmare(0, "ups"), youWaitedForMe(prov)], () => {});
