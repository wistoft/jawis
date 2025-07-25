import { TestProvision } from "^jarun";

import { getBeeDeps, makeInMemoryWppMain } from "../_fixture";

export default (prov: TestProvision) => {
  const bee = makeInMemoryWppMain(prov)(getBeeDeps(prov));

  return bee.waiter.await("message").then(bee.shutdown);
};
