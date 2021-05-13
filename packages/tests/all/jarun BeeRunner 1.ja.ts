import { TestProvision } from "^jarun";

import { getScriptPath, brRunTest } from "../_fixture";

export default (prov: TestProvision) =>
  brRunTest(prov, getScriptPath("hello.js")).promise;
