import { nightmare, PromiseAwait } from "^jab";
import { TestProvision } from "^jarun";

// await rejecting promise

export default (prov: TestProvision) => {
  const awaiter = new PromiseAwait(prov);

  awaiter.await(nightmare(10));

  return awaiter.start();
};
