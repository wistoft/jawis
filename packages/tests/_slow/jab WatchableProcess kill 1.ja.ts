import { TestProvision } from "^jarun";

import { getJabWatchableProcess, getScriptPath } from "../_fixture";

export default (prov: TestProvision) =>
  getJabWatchableProcess(prov, {
    filename: getScriptPath("silentWait.js"),
  }).then((wp) => wp.noisyKill());
