import { err } from "^jab";
import { TestProvision } from "^jarun";

import { filterTestLogs, getJarunTestProvision } from "../_fixture";

//reserved property name, shouldn't cause problems.

export default (prov: TestProvision) => {
  const jtp = getJarunTestProvision(prov);

  try {
    jtp.eq(1, { toString: 1 });
    err("unreach");
  } catch (e) {
    jtp.onError(e);
  }

  return filterTestLogs(jtp.logs);
};
