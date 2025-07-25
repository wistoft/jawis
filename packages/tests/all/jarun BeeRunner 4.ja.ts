import { TestProvision } from "^jarun";

import { getScriptPath, brRunTest, filterTestResult } from "../_fixture";

//stdout is also returned, when error is thrown in worker.

export default (prov: TestProvision) =>
  brRunTest(prov, getScriptPath("stdoutAndThrow.js")).promise.then(
    filterTestResult
  );
