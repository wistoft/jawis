import { TestProvision } from "^jarun";

import { nightmare, safeAll, sleeping } from "^yapu";

export default (prov: TestProvision) =>
  safeAll(
    [nightmare(0, "first"), nightmare(10, "second")],
    prov.onError

    // wait for second error to be reported
  ).finally(() => sleeping(20));
