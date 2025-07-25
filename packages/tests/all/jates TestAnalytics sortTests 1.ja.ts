import { TestProvision } from "^jarun";

import { getTestAnalytics, makeTestInfo } from "../_fixture";

export default (prov: TestProvision) => {
  const ta = getTestAnalytics();

  ta.setTestExecTime("1", 1);
  ta.setTestExecTime("2", 2);

  prov.imp(
    ta.sortTests([makeTestInfo("1"), makeTestInfo("2"), makeTestInfo("3")])
  );
  prov.imp(
    ta.sortTests([makeTestInfo("2"), makeTestInfo("1"), makeTestInfo("3")])
  );
};
