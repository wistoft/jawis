import { TestProvision } from "^jarun";

import { emptyScratchFolder, getTestLogController_scratch } from "../_fixture";

//accept a user log

export default async (prov: TestProvision) => {
  emptyScratchFolder();

  const tlc = getTestLogController_scratch(prov);

  const id = "1";

  //add

  tlc.setCurLogs(id, { user: { hej: ["dav"] } });

  prov.imp(await tlc.acceptTestLog(id, "hej"));

  prov.eq({ user: { hej: ["dav"] } }, await tlc.getExpLogs(id));

  //remove

  tlc.setCurLogs(id, { user: {} });

  prov.imp(await tlc.acceptTestLog(id, "hej"));

  prov.eq({ user: {} }, await tlc.getExpLogs(id));
};
