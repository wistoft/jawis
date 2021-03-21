import { TestProvision } from "^jarun";

import { getTestLogController_scratch } from "../_fixture";

export default async (prov: TestProvision) => {
  const tlc = getTestLogController_scratch(prov);

  prov.eq({ user: {} }, await tlc.getExpLogs("dontExist"));
};
