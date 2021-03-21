import { TestProvision } from "^jarun";

import { errorData0, filterErrorLog } from "../_fixture";

export default (prov: TestProvision) => {
  prov.eq([], filterErrorLog([]));

  //error log is filtered

  prov.imp(filterErrorLog([errorData0]));
};
