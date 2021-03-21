import { TestProvision } from "^jarun";

import { getTestAnalytics } from "../_fixture";

export default (prov: TestProvision) => {
  const ta = getTestAnalytics(prov);

  ta.setTestExecTime("1", 1);
  ta.setTestExecTime("2", 2);

  prov.eq(["3", "1", "2"], ta.sortTests(["1", "2", "3"]));
  prov.eq(["3", "1", "2"], ta.sortTests(["2", "1", "3"]));
};
