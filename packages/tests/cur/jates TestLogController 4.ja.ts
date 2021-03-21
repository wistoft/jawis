import { TestProvision } from "^jarun";

import { getTestLogController_scratch } from "../_fixture";

export default async (prov: TestProvision) => {
  const tlc = getTestLogController_scratch(prov);

  await tlc.setExpLogs("1", { user: { hej: ["dav"] } });

  prov.eq({ user: { hej: ["dav"] } }, await tlc.getExpLogs("1"));
};
