import { TestProvision } from "^jarun";

import { getJabProcess_ready, getScriptPath } from "../_fixture";

// child needs shutdown command.

export default (prov: TestProvision) =>
  getJabProcess_ready(prov, {
    filename: getScriptPath("ipcSendAndWait.js"),
  }).then((process) =>
    process.shutdown().then(() => {
      prov.eq("stopped", process.waiter.getState());
    })
  );
