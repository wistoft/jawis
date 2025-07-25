import { TestProvision } from "^jarun";

import { getNodeProcess, getScriptPath } from "../_fixture";

//receive message

export default (prov: TestProvision) => {
  const proc = getNodeProcess(prov, {
    filename: getScriptPath("ipcSendOnly.js"),
  });
  return proc.waiter.await("message").then(() => proc.waiter.await("stopped"));
};
