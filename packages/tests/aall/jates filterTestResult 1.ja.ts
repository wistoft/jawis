import { TestProvision } from "^jarun";

import { errorData0, filterTestResult } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(filterTestResult({ cur: { user: {} } }));
  prov.imp(
    filterTestResult({ cur: { user: {} }, execTime: 123, requireTime: 234 })
  );

  //error log is filtered

  prov.imp(filterTestResult({ cur: { err: [errorData0], user: {} } }));
};
