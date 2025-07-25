import { TestProvision } from "^jarun";

import { getNodeProcess, getScriptPath } from "../_fixture";

export default (prov: TestProvision) =>
  getNodeProcess(prov, {
    filename: getScriptPath("stderrWithExit0.js"),
  }).waiter.await("stopped");
