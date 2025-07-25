import { TestProvision } from "^jarun";

import { getNodeProcess, getScriptPath } from "../_fixture";

// shutdown an ipc script, before its ready

export default (prov: TestProvision) => {
  const proc = getNodeProcess(prov, {
    filename: getScriptPath("ipcSendAndWait.js"),
  });

  return proc.shutdown();
};
