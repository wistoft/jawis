import { nightmare, PromiseAwait } from "^yapu";
import { TestProvision } from "^jarun";

// await rejecting promise

export default (prov: TestProvision) => {
  const awaiter = new PromiseAwait(prov);

  awaiter.await(nightmare(10));

  return awaiter.start();
};
