import { TestProvision } from "^jarun";

import { getNodeProcess_ready, getScriptPath } from "../_fixture";

// child needs shutdown command.

export default (prov: TestProvision) =>
  getNodeProcess_ready(prov, {
    filename: getScriptPath("ipcSendAndWait.js"),
  }).then((process) =>
    process.shutdown().then(() => {
      prov.eq("stopped", process.waiter.getState());
    })
  );
