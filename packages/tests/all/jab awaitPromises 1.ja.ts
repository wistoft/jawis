import { PromiseAwait } from "^yapu";
import { TestProvision } from "^jarun";

import { youWaitedForMe } from "../_fixture";

// await resolving promise

export default (prov: TestProvision) => {
  const awaiter = new PromiseAwait(prov);

  awaiter.await(youWaitedForMe(prov));

  return awaiter.start();
};
