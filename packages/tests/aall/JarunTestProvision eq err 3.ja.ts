import { TestProvision } from "^jarun";

import { filterTestLogs, getJarunTestProvision } from "../_fixture";

//data is cloned

export default (prov: TestProvision) => {
  const jtp = getJarunTestProvision(prov);

  try {
    jtp.eq(undefined, [1, 2, 3]);
  } catch (e) {
    jtp.onError(e);
  }

  return filterTestLogs(jtp.logs);
};
