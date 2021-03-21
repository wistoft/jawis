import { TestProvision } from "^jarun";

import { getJabProcess, getScriptPath } from "../_fixture";

//receive message

export default (prov: TestProvision) => {
  const proc = getJabProcess(prov, {
    filename: getScriptPath("ipcSendOnly.js"),
  });
  return proc.waiter.await("message").then(() => proc.waiter.await("stopped"));
};
