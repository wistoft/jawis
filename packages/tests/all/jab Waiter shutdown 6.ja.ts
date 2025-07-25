import { TestProvision } from "^jarun";

import { safeAll, sleeping } from "^yapu";
import { getWaiter } from "../_fixture";

// changing state between two shutdown call must not cause problems.

export default async (prov: TestProvision) => {
  const waiter = getWaiter(prov, { hardTimeout: 100 });

  const p1 = waiter.shutdown(() => {});

  //wait for await to be registered

  await sleeping(10);

  waiter.set("starting"); //must not hinder shutdown

  const p2 = waiter.shutdown(() => {});

  waiter.set("done"); //now they both must resolve

  return safeAll([p1, p2], prov.onError);
};
