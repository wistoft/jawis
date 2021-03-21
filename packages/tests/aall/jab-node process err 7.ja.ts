import { TestProvision } from "^jarun";

import { getJabProcess, getScriptPath } from "../_fixture";

export default (prov: TestProvision) =>
  getJabProcess(prov, {
    filename: getScriptPath("stderrWithExit0.js"),
  }).waiter.await("stopped");
