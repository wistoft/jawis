import { TestProvision } from "^jarun";

import { getScriptPath, brRunTest } from "../_fixture";

//messages are collected.

export default (prov: TestProvision) =>
  brRunTest(prov, getScriptPath("beeSend.js")).promise;
