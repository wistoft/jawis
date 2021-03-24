import { awaitPromises, TestProvision } from "^jarun";

import { getJarunTestProvision, youWaitedForMe } from "../_fixture";

// await resolving promise

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  inner.await(youWaitedForMe(prov));

  return awaitPromises(inner);
};
