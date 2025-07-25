import { TestProvision } from "^jarun";

import { safeAll, sleeping } from "^yapu";
import { getWaiter } from "../_fixture";

// double shutdown (in same tick)

export default (prov: TestProvision) => {
  const waiter = getWaiter(prov, { hardTimeout: 100 });

  const p1 = waiter.shutdown(() => {});
  const p2 = waiter.shutdown(() => {});

  sleeping(5).then(() => {
    //delay was needed to provoke bug
    waiter.set("done");
  });

  return safeAll([p1, p2], prov.onError);
};
