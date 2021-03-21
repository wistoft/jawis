import { TestProvision } from "^jarun";

import { getTestLogController_test_suite } from "../_fixture";

export default (prov: TestProvision) => {
  const tlc = getTestLogController_test_suite(prov);

  tlc.setCurLogs("1", { user: { bla: [1] } });

  prov.eq({ user: { bla: [1] } }, tlc.getCurLogs("1"));
};
