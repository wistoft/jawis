import { TestProvision } from "^jarun";

import {
  getTestLogController_scratch,
  errorData1,
  emptyScratchFolder,
} from "../_fixture";

//accept all logs for a test case.

export default async (prov: TestProvision) => {
  emptyScratchFolder();

  const tlc = getTestLogController_scratch(prov);

  const id = "1";

  //err log

  tlc.setCurLogs(id, { err: [errorData1], user: { hej: [7] } });

  prov.imp(await tlc.acceptTestLogs(id));

  prov.eq(
    { err: ["Some message from server"], user: { hej: [7] } },
    await tlc.getExpLogs(id)
  );

  //remove and update

  tlc.setCurLogs(id, { user: { hej: [9] } });

  prov.imp(await tlc.acceptTestLogs(id));

  prov.eq({ user: { hej: [9] } }, await tlc.getExpLogs(id));
};
