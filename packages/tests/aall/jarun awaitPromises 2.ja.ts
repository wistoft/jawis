import { nightmare } from "^jab";
import { awaitPromises, TestProvision } from "^jarun";

import { filterTestLogs, getJarunTestProvision } from "../_fixture";

// await rejecting promise

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  inner.await(nightmare(10));

  return awaitPromises(inner).then(() => {
    prov.imp(filterTestLogs(inner.logs));
  });
};
