import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { getWaiter } from "../_fixture";

// changing state after call to shutdown must not hinder shutdown

export default async (prov: TestProvision) => {
  const waiter = getWaiter(prov, { hardTimeout: 100 });

  const p1 = waiter.shutdown(() => {});

  //wait for await to be registered

  await sleeping(10);

  waiter.set("starting"); //must not cause problems.

  waiter.set("done"); //now it must resolve

  return p1;
};
