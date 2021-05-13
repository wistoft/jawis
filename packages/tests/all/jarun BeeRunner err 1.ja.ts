import { TestProvision } from "^jarun";

import {
  getScriptPath,
  brRunTest,
  filterTestResult,
} from "../_fixture";

export default (prov: TestProvision) =>
  brRunTest(prov, getScriptPath("throw.js")).promise.then(filterTestResult);
