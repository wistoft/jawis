import { TestProvision } from "^jarun";

import { filterTestLogs, getJarunTestProvision } from "../_fixture";

//chk errors are added to chk logs

export default (prov: TestProvision) => {
  const jtp = getJarunTestProvision(prov);

  try {
    jtp.eq(1, 2);
  } catch (e) {
    jtp.onError(e);
  }

  return filterTestLogs(jtp.logs);
};
