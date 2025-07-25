import { TestProvision } from "^jarun";

import { getNodeProcess, getScriptPath } from "../_fixture";

export default (prov: TestProvision) =>
  getNodeProcess(prov, {
    filename: getScriptPath("silentWait.js"),
  }).waiter.await("message", 1); //timeout here
