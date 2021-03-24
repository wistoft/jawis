import { TestProvision } from "^jarun";

import { getTestLogController_test_suite } from "../_fixture";

export default (prov: TestProvision) => {
  const tlc = getTestLogController_test_suite(prov);

  return tlc.getExpLogs("1").then((data) => {
    prov.eq({ user: { blu: [1] } }, data);
  });
};
