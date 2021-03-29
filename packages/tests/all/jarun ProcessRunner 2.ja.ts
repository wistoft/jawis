import { TestProvision } from "^jarun";

import { getScriptPath, prRunTest } from "../_fixture";

//messages are collected.

export default (prov: TestProvision) => {
  const { promise } = prRunTest(prov, getScriptPath("ipcSendOnly.js"));

  return promise;
};
