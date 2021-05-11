import { TestProvision } from "^jarun";

import { getTestLogController_scratch } from "../_fixture";
import { emptyScratchFolder } from "^tests/_fixture/util/diverse";

//accept a user log

export default async (prov: TestProvision) => {
  emptyScratchFolder();

  const tlc = getTestLogController_scratch(prov);

  //add

  tlc.setCurLogs("1", { user: { hej: ["dav"] } });

  prov.imp(await tlc.acceptTestLog("1", "hej"));

  prov.eq({ user: { hej: ["dav"] } }, await tlc.getExpLogs("1"));

  //remove

  tlc.setCurLogs("1", { user: {} });

  prov.imp(await tlc.acceptTestLog("1", "hej"));

  prov.eq({ user: {} }, await tlc.getExpLogs("1"));
};
