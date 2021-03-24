import { TestProvision } from "^jarun";

import { getJabProcess, getScriptPath } from "../_fixture";

export default (prov: TestProvision) =>
  getJabProcess(prov, {
    filename: getScriptPath("silentWait.js"),
  }).waiter.await("message"); //timeout here
