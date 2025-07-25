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

  const id = "1";

  //err log

  tlc.setCurLogs(id, { err: [errorData1], user: {} });

  prov.imp(await tlc.acceptTestLog(id, "err"));

  prov.eq(
    { err: ["Some message from server"], user: {} },
    await tlc.getExpLogs(id)
  );

  //remove

  tlc.setCurLogs(id, { user: {} });

  prov.imp(await tlc.acceptTestLog(id, "err"));

  prov.eq({ user: {} }, await tlc.getExpLogs(id));
};
