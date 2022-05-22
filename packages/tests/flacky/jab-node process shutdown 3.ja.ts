import { TestProvision } from "^jarun";

import { getJabProcess, getScriptPath } from "../_fixture";

// shutdown an ipc script, before its ready

export default (prov: TestProvision) => {
  const proc = getJabProcess(prov, {
    filename: getScriptPath("ipcSendAndWait.js"),
  });

  return proc.shutdown();
};
