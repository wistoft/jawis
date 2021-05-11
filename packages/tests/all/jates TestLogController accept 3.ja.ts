import { TestProvision } from "^jarun";

import { getTestLogController_scratch, errorData1 } from "../_fixture";
import { emptyScratchFolder } from "^tests/_fixture/util/diverse";

//accept all logs for a test case.

export default async (prov: TestProvision) => {
  emptyScratchFolder();

  const tlc = getTestLogController_scratch(prov);

  //err log

  tlc.setCurLogs("1", { err: [errorData1], user: { hej: [7] } });

  prov.imp(await tlc.acceptTestLogs("1"));

  prov.eq(
    { err: ["Some message from server"], user: { hej: [7] } },
    await tlc.getExpLogs("1")
  );

  //remove and update

  tlc.setCurLogs("1", { user: { hej: [9] } });

  prov.imp(await tlc.acceptTestLogs("1"));

  prov.eq({ user: { hej: [9] } }, await tlc.getExpLogs("1"));
};
