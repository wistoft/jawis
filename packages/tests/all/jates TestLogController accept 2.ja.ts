import { TestProvision } from "^jarun";

import {
  getTestLogController_scratch,
  errorData1,
  emptyScratchFolder,
} from "../_fixture";

//accept an error log

export default async (prov: TestProvision) => {
  emptyScratchFolder();

  const tlc = getTestLogController_scratch(prov);

  //err log

  tlc.setCurLogs("1", { err: [errorData1], user: {} });

  prov.imp(await tlc.acceptTestLog("1", "err"));

  prov.eq(
    { err: ["Some message from server"], user: {} },
    await tlc.getExpLogs("1")
  );

  //remove

  tlc.setCurLogs("1", { user: {} });

  prov.imp(await tlc.acceptTestLog("1", "err"));

  prov.eq({ user: {} }, await tlc.getExpLogs("1"));
};
